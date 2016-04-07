///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const async = require('async');
const deepExtend = require('deep-extend');
const positive = require('positive');
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import Argv = yargs.Argv;
import * as _ from 'lodash';
import {ProgressBar} from "../util/progress-bar";
import ContainerRemoveResults = dockerode.ContainerRemoveResults;
import DockerImage = dockerode.DockerImage;
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
    this.pushRemoveCommand();
  }

  private pushRemoveCommand() {
    let removeCommand = new CommandImpl();
    removeCommand.aliases = ['rm'];
    removeCommand.commandDesc = 'Remove Docker containers';
    removeCommand.handler = (argv)=> {
      this.removeContainers(argv._.slice(2), (err:Error, msg:string)=> {
        this.processExit(0);
      });
    };
    this.subCommands.push(removeCommand);
  }

  private pushStartCommand() {
    let startCommand = new CommandImpl();
    startCommand.aliases = ['start'];
    startCommand.commandDesc = 'Start Docker containers';
    startCommand.handler = (argv)=> {
      this.startOrStopContainers(argv._.slice(2), true, ()=>this.processExit());
    };
    this.subCommands.push(startCommand);
  }

  private pushStopCommand() {
    let stopCommand = new CommandImpl();
    stopCommand.aliases = ['stop'];
    stopCommand.commandDesc = 'Stop Docker containers';
    stopCommand.handler = (argv)=> {
      this.startOrStopContainers(argv._.slice(2), false, ()=>this.processExit());
    };
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
      this.prettyPrintDockerContainerList(err, containers, argv.a);
    });
  }

  public buildDockerFile(dockerFilePath:string, dockerImageName:string, cb:(err:Error)=>void) {
    try {
      //Check existence of dockerFilePath
      require('fs').statSync(dockerFilePath);
    } catch (err) {
      if (this.callbackIfError(cb, err)) {
        return;
      }
    }
    try {
      let tar = require('tar-fs');
      let tarStream = tar.pack(dockerFilePath);
      tarStream.on('error', (err:Error)=> {
        cb(err);
      });
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
          this.callbackIfError(cb, new Error("Error creating image: '" + dockerImageName + "'"));
        });
      });
    } catch (err) {
      this.callbackIfError(cb, err);
    }
  }

  public pullImage(imageName:string, cb:(err:Error)=>void) {
    DockerCommand.docker.pull(imageName,
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
          let msg = "Unable to pull image: '" + imageName + "'";
          cb(new Error(msg));
        });
      });
  }

  public createContainer(containerConfig:any, cb:(err:Error, container:any)=>void) {
    var fullContainerConfigCopy = {ExpressApps: []};
    //deepExtend(fullContainerConfigCopy, DockerDescriptors.dockerContainerDefaultDescriptor);
    deepExtend(fullContainerConfigCopy, containerConfig);
    DockerCommand.docker.createContainer(fullContainerConfigCopy, (err:Error, container:any)=> {
      cb(err, container);
    });
  }

  public removeContainers(containerIds:string[],
                          cb:(err:Error, containerRemoveResults:ContainerRemoveResults[])=>void) {
    let self = this;
    if(!containerIds.length){
      console.log('Specify containers to remove by FirmamentId, Docker ID or Name. Or "*" to remove all.')
      return;
    }
    if(_.indexOf(containerIds, 'all') !== -1){
      if (!positive("You're sure you want to remove all containers? [y/N] ", false)) {
        console.log( 'Operation canceled.')
        cb(null, null);
        return;
      }
      containerIds = null;
    }
    this.getContainers(containerIds, (err:Error, containers:any[])=> {
      this.logError(err);
      async.map(containers,
        (containerOrErrorMsg, cb)=> {
          if (typeof containerOrErrorMsg === 'string') {
            this.logAndCallback(containerOrErrorMsg, cb, null, {msg: containerOrErrorMsg});
          } else {
            containerOrErrorMsg.remove({force: 1}, (err:Error)=> {
              var msg = 'Removing container "' + containerOrErrorMsg.name + '"';
              self.logAndCallback(msg, cb, err, {msg: containerOrErrorMsg.name});
            });
          }
        }, cb);
    });
  }

  public startOrStopContainers(containerIds:any[], start:boolean, cb:()=>void) {
    this.getContainers(containerIds, (err:Error, containers:any[])=> {
      this.logError(err);
      async.mapSeries(containers,
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
        }, cb);
    });
  }

  private getContainers(ids:string[], cb:(err:Error, containers:any[])=>void) {
    if(!ids){
      this.listContainers(true,(err:Error,containers:any[])=>{
        if (this.callbackIfError(cb, err)) {
          return;
        }
        ids = [];
        containers.forEach(container=>{
          ids.push(container.firmamentId);
        });
        this.getContainers(ids, cb);
      });
      return;
    }
    let fnArray = ids.map(id=> {
      return async.apply(this.getContainer.bind(this), id.toString());
    });
    async.series(fnArray, (err:Error, results:any[])=> {
      if (!this.callbackIfError(cb, err)) {
        cb(err, results.filter(result=>result));
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
              if (charCount < 3) {
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

  public listImages(listAllImages:boolean = false, cb:(err:Error, images:DockerImage[])=>void) {
    DockerCommand.docker.listImages({all: listAllImages}, (err:Error, images:DockerImage[])=> {
      if (this.callbackIfError(cb, err)) {
        return;
      }
      //Sort by name so firmament id is consistent
      images.sort(function (a, b) {
        return a.RepoTags[0].localeCompare(b.RepoTags[0]);
      });
      let firmamentId = 0;
      images = images.map((image:DockerImage)=> {
        image.firmamentId = (++firmamentId).toString();
        return image;
      }).filter((image:DockerImage)=> {
        return image !== null;
      });
      cb(null, images);
    });
  }

  private listContainers(listAllContainers:boolean, cb:(err:Error, containers?:any[])=>void) {
    DockerCommand.docker.listContainers({all: true}, (err:Error, allContainers:any[])=> {
      if (this.callbackIfError(cb, err)) {
        return;
      }
      //Sort by name so firmament id is consistent
      allContainers.sort(function (a, b) {
        return a.Names[0].localeCompare(b.Names[0]);
      });
      let firmamentId = 0;
      let containers = allContainers.map(container=> {
        container.firmamentId = (++firmamentId).toString();
        return (listAllContainers || (container.Status.substring(0, 2) === 'Up')) ? container : null;
      }).filter(container=> {
        return container;
      });
      cb(null, containers);
    });
  }

  private prettyPrintDockerContainerList(err:Error, containers:any[], all:boolean) {
    if (!containers || !containers.length) {
      this.processExit(0,
        this.returnErrorStringOrMessage(err, '\nNo ' + (all ? '' : 'Running ') + 'Containers\n'));
    } else {
      console.table(containers.map(container=> {
        return {
          ID: container.firmamentId,
          Name: container.Names[0],
          Image: container.Image,
          DockerId: container.Id.substring(0, 11),
          Status: container.Status
        };
      }));
      this.processExit();
    }
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
      arr.forEach(record=> {
        if (typeof record === 'string' ||
          typeof record === 'number') {
          t.cell('item', record);
        } else {
          // assume plain object
          Object.keys(record).forEach(property=> {
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
      return keys.map(key=> {
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
      console.log('');
      let args = Array.prototype.slice.call(arguments);
      if (args.length === 2 &&
        typeof args[0] === 'string' &&
        Array.isArray(args[1])) {
        return printTitleTable(args[0], args[1]);
      }
      args.forEach(k=> {
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

