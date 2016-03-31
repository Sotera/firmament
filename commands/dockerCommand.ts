///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const async = require('async');
const deepExtend = require('deep-extend');
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import Argv = yargs.Argv;
import {DockerDescriptors} from "../util/docker-descriptors";
import {ProgressBar} from "../util/progress-bar";
interface ConsoleEx extends Console {
  table:any
}
declare let console:ConsoleEx;
export class DockerCommand extends CommandImpl {
  static docker = new (require('dockerode'))({socketPath: '/var/run/docker.sock'});
  static progressBar = new ProgressBar();

  constructor() {
    log.trace('Constructing DockerCommand instance');
    super();
    this.setupConsoleTable();
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['docker', 'd'];
    this.command = '<subCommand>';
    this.commandDesc = 'Support for working with Docker containers';
    this.pushPsCommand();
    this.pushStartCommand();
    this.pushStopCommand();
  }

  private pushStartCommand() {
    let startCommand = new CommandImpl();
    startCommand.aliases = ['start'];
    startCommand.commandDesc = 'Start Docker containers';
    startCommand.handler = (argv)=> this.startOrStopContainers(argv, true)
    this.subCommands.push(startCommand);
  }

  private pushStopCommand() {
    let stopCommand = new CommandImpl();
    stopCommand.aliases = ['stop'];
    stopCommand.commandDesc = 'Stop Docker containers';
    stopCommand.handler = (argv)=> this.startOrStopContainers(argv, false)
    this.subCommands.push(stopCommand);
  }

  private pushPsCommand() {
    let psCommand = new CommandImpl();
    psCommand.aliases = ['ps'];
    psCommand.commandDesc = 'List Docker containers';
    psCommand.options = {
      all: {
        alias: 'a',
        boolean: true,
        default: false,
        desc: 'Show non-running containers also'
      }
    };
    psCommand.handler = (argv:yargs.Argv)=> this.printContainerList(argv);
    this.subCommands.push(psCommand);
  }

  private printContainerList(argv:any) {
    this.listContainers(argv.a, (err, containers)=> {
      this.prettyPrintDockerContainerList(err, containers, argv.a, ()=> {
        process.exit(0);
      });
    });
  }

  public pullImage(containerConfig:any, cb:(err:Error)=>void) {
    DockerCommand.docker.pull(containerConfig.Image,
      (err, outputStream)=> {
        let error:Error = null;
        if (err) {
          cb(err);
          return;
        }
        outputStream.on('data', (chunk) => {
          try {
            let data = JSON.parse(chunk);
            if (data.error) {
              error = new Error(data.error);
              return;
            }
            if (data.status === 'Downloading' || data.status === 'Extracting') {
              DockerCommand.progressBar.showProgressForTask(data.id,
                data.status,
                data.progressDetail.current,
                data.progressDetail.total);
            }
          } catch (err) {
            error = err;
          }
        });
        outputStream.on('end', () => {
          cb(error);
        });
        outputStream.on('error', function () {
          let msg = "Unable to pull image: '" + containerConfig.Image + "'";
          cb(new Error(msg));
        });
      });
  }

  public createContainer(containerConfig:any, cb?:(err:Error, results)=>void) {
    let fullContainerConfig = {};
    deepExtend(fullContainerConfig, DockerDescriptors.dockerContainerDefaultDescriptor);
    deepExtend(fullContainerConfig, containerConfig);
    DockerCommand.docker.createContainer(fullContainerConfig, function (err, result) {
      cb(err, result);
    });
  }

  public buildDockerFile(dockerFilePath:string, dockerImageName:string, cb:(err:Error, results?:any)=>void) {
    try {
      //Check existence of Docker directory
      require('fs').statSync(dockerFilePath);
    } catch (err) {
      cb(err);
      return;
    }
    let tar = require('tar-fs');
    let tarStream = tar.pack(dockerFilePath);
    try {
      DockerCommand.docker.buildImage(tarStream, {
        t: dockerImageName
      }, function (err, outputStream) {
        if (err) {
          cb(err);
          return;
        }
        let error:Error = null;
        outputStream.on('data', function (chunk) {
          try {
            let data = JSON.parse(chunk);
            if (data.error) {
              error = data.error;
              return;
            }
            if (data.status == 'Downloading' || data.status == 'Extracting') {
              DockerCommand.progressBar.showProgressForTask(data.id,
                data.status,
                data.progressDetail.current,
                data.progressDetail.total);
            }
          } catch (err) {
            error = err;
          }
        });
        outputStream.on('end', function () {
          //A sad little hack to not stop processing on the 'tag not found error'. We'll do
          //this better next time.
          cb(error
          && error.message
          && error.message.indexOf('not found in repository') === -1
            ? error
            : null);
        });
        outputStream.on('error', function () {
          var msg = "Error creating image: '" + dockerImageName + "'";
          cb(new Error(msg));
        });
      });
    } catch (err) {
      cb(err);
    }
  }

  public removeContainerByName(containerName:string, cb:(err:Error, results)=>void) {
    let self = this;
    let containerDockerId = '<unknown>';
    async.waterfall([
        (cb:(err:Error)=>void)=> {
          self.listContainers(true, cb);
        },
        (containers:any[], cb:(err:Error, containerDockerId?:string)=>void)=> {
          try {
            containerDockerId = containers.filter(function (container) {
              for (let i = 0; i < container.Names.length; ++i) {
                if (containerName === container.Names[i]) {
                  return true;
                }
              }
              return false;
            })[0].Id;
          } catch (err) {
            cb(new Error('Container "' + containerName + '" does not exist.'));
            return;
          }
          cb(null, containerDockerId);
        },
        (containerDockerId:string, cb:(err:Error)=>void)=> {
          try {
            console.log("Removing Docker container: '" + containerName + "' ...");
            DockerCommand.docker.getContainer(containerDockerId).remove({force: 1}, (err:Error)=> {
              cb(null);
            });
          } catch (err) {
            cb(err);
          }
        },
      ],
      (err:Error, results)=> {
        if (err) {
          log.error(err.message);
        } else {
          console.log("Docker container: '" + containerName + "' Removed.");
        }
        cb(err, results);
      });
  }

  private startOrStopContainers(argv:any, start:boolean) {
    this.getContainers(argv._.slice(2), (err:Error, containers:any[])=> {
      this.logError(err);
      async.each(containers,
        (containerOrErrorMsg, cb)=> {
          if (typeof containerOrErrorMsg === 'string') {
            this.logAndCallback(containerOrErrorMsg, cb);
          } else {
            let resultMessage = 'Container "' + containerOrErrorMsg.name + '" ';
            resultMessage += start ? 'started.' : 'stopped.';
            let fnStartStop = start
              ? containerOrErrorMsg.start.bind(containerOrErrorMsg)
              : containerOrErrorMsg.stop.bind(containerOrErrorMsg);
            fnStartStop((err:Error)=> {
              this.logAndCallback(this.returnErrorStringOrMessage(err, resultMessage), cb);
            });
          }
        },
        ()=> {
          this.processExit();
        }
      );
    });
  }

  private getContainers(ids:string[], cb:(err:Error, containers:any[])=>void) {
    let fnArray = [];
    ids.forEach(id=> {
      fnArray.push(async.apply(this.getContainer.bind(this), id.toString()));
    });
    async.parallel(fnArray, (err:Error, results:any[])=> {
      if (err) {
        cb(err, []);
      } else {
        cb(err, results.filter(result=> {
          return result;
        }));
      }
    });
  }

  private getContainer(id:string, cb:(err:Error, container:any)=>void) {
    let self = this;
    async.waterfall([
        (cb:(err:Error)=>void)=> {
          self.listContainers(true, cb);
        },
        (containers:any[], cb:(err:Error, container:any)=>void)=> {
          let foundContainers = containers.filter(container=> {
            if (container.firmamentId === id) {
              return true;
            } else {
              for (let i = 0; i < container.Names.length; ++i) {
                if (container.Names[i] === (id[0] === '/' ? id : '/' + id)) {
                  return true;
                }
              }
              let lowerCaseId = id.toLowerCase();
              let charCount = lowerCaseId.length;
              if(charCount < 3){
                return false;
              }
              return container.Id.toLowerCase().substring(0, charCount) ===
                lowerCaseId.substring(0, charCount);
            }
          });
          if (foundContainers.length > 0) {
            let containerObject = DockerCommand.docker.getContainer(foundContainers[0].Id);
            containerObject.name = foundContainers[0].Names[0];
            cb(null, containerObject);
          } else {
            cb(null, 'Unable to find container: "' + id + '"');
          }
        }
      ],
      cb);
  }

  public listContainers(listAllContainers:boolean, cb:(err:Error, containers?:any[])=>void) {
    DockerCommand.docker.listContainers({all: true}, (err:Error, allContainers:any[])=> {
      if (err) {
        cb(err);
        return;
      }
      //Sort by name so firmament id is consistent
      allContainers.sort(function (a, b) {
        return a.Names[0].localeCompare(b.Names[0]);
      });
      let containers = [];
      let firmamentId = 0;
      allContainers.forEach(container=> {
        container.firmamentId = (++firmamentId).toString();
        if (listAllContainers) {
          containers.push(container);
        } else if (container.Status.substring(0, 2) === 'Up') {
          containers.push(container);
        }
      });
      cb(null, containers);
    });
  }

  private prettyPrintDockerContainerList(err:Error, containers:any[], all:boolean, cb:()=>void):void {
    console.log('');//Line feed
    if (!containers || !containers.length) {
      console.log(err
        ? err.message + '\n'
        : 'No ' + (all ? '' : 'Running ') + 'Containers\n');
      cb();
      return;
    }
    let displayContainers = [];
    containers.forEach(function (container) {
      let displayContainer = {
        ID: container.firmamentId,
        Name: container.Names[0],
        Image: container.Image,
        DockerId: container.Id.substring(0, 11),
        Status: container.Status
      };
      displayContainers.push(displayContainer);
    });
    console.table(displayContainers);
    cb();
  }

  private setupConsoleTable() {
    if (typeof console === 'undefined') {
      throw new Error('Weird, console object is undefined');
    }
    if (typeof console.table === 'function') {
      return;
    }
    let Table = require('easy-table');

    function arrayToString(arr) {
      let t = new Table();
      arr.forEach(function (record) {
        if (typeof record === 'string' ||
          typeof record === 'number') {
          t.cell('item', record);
        } else {
          // assume plain object
          Object.keys(record).forEach(function (property) {
            t.cell(property, record[property]);
          });
        }
        t.newRow();
      });
      return t.toString();
    }

    function printTitleTable(title, arr) {
      let str = arrayToString(arr);
      let rowLength = str.indexOf('\n');
      if (rowLength > 0) {
        if (title.length > rowLength) {
          rowLength = title.length;
        }
        console.log(title);
        let sep = '-', k, line = '';
        for (k = 0; k < rowLength; k += 1) {
          line += sep;
        }
        console.log(line);
      }
      console.log(str);
    }

    function objectToArray(obj) {
      let keys = Object.keys(obj);
      return keys.map(function (key) {
        return {
          key: key,
          value: obj[key]
        };
      });
    }

    function objectToString(obj) {
      return arrayToString(objectToArray(obj));
    }

    console.table = function () {
      let args = Array.prototype.slice.call(arguments);
      if (args.length === 2 &&
        typeof args[0] === 'string' &&
        Array.isArray(args[1])) {
        return printTitleTable(args[0], args[1]);
      }
      args.forEach(function (k) {
        if (typeof k === 'string') {
          return console.log(k);
        } else if (Array.isArray(k)) {
          console.log(arrayToString(k));
        } else if (typeof k === 'object') {
          console.log(objectToString(k));
        }
      });
    };
  }
}

