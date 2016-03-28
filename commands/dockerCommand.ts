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
    this.aliases = ['d', 'docker'];
    this.command = '<subCommand>';
    this.commandDesc = 'Support for working with Docker containers';
    this.pushPsCommand();
  }

  private pushPsCommand() {
    let psCommand = new CommandImpl();
    psCommand.aliases = ['ps'];
    psCommand.commandDesc = 'List Docker containers';
    psCommand.builder = {
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
      this.prettyPrintDockerContainerList(containers, false, argv.a);
    });
  }

  public pullImage(containerConfig:any, cb?:(err:Error)=>void) {
    DockerCommand.docker.pull(containerConfig.Image,
      (err, outputStream)=> {
        outputStream.on('data', (chunk) => {
          try {
            let data = JSON.parse(chunk);
            if (data.error) {
              cb(new Error(data.error));
              return;
            }
            if (data.status === 'Downloading' || data.status === 'Extracting'){
              DockerCommand.progressBar.showProgressForTask(data.id,
                data.status,
                data.progressDetail.current,
                data.progressDetail.total);
            }
          } catch (err) {
            cb(err);
          }
        });
        outputStream.on('end', () => {
          cb(null);
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
  
  public buildDockerFile(dockerFilePath:string, dockerImageName:string, cb?:(err:Error, results?:any)=>void){
    try {
      //Check existence of Docker directory
      let fs = require('fs');
      fs.statSync(dockerFilePath);
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
        var ProgressBar = requireCache('progress');
        var progressBars = {};
        outputStream.on('data', function (chunk) {
          try {
            /*          console.log('-' + chunk);
             return;*/
            var data = JSON.parse(chunk);
            if (data.error) {
              options.data = data;
              return;
            }
            if (data.status == 'Downloading' || data.status == 'Extracting') {
              if (data.progressDetail && data.progressDetail.total) {
                if (!progressBars[data.id + data.status]) {
                  progressBars[data.id] = new ProgressBar('Id: ' + data.id + ' [:bar] :percent', {
                    complete: '=',
                    incomplete: ' ',
                    width: 40,
                    total: data.progressDetail.total
                  });
                  progressBars[data.id].lastCurrent = 0;
                }
                progressBars[data.id].tick(data.progressDetail.current - progressBars[data.id].lastCurrent);
                progressBars[data.id].lastCurrent = data.progressDetail.current;
              }
            } else if (data.stream) {
              console.log('>' + data.stream);
            }
          } catch (ex) {
            util_LogError(ex);
          }
        });
        outputStream.on('end', function () {
          if (options.data && options.data.error) {
            //A sad little hack to not stop processing on the 'tag not found error'. We'll do
            //this better next time.
            if (options.data.error.indexOf('not found in repository') == -1) {
              callback(options.data, {Message: "Error building: '" + options.Image + "'."});
            } else {
              callback(null, {Message: "Image: '" + options.Image + "' built."});
            }
          } else {
            callback(null, {Message: "Image: '" + options.Image + "' built."});
          }
        });
        outputStream.on('error', function () {
          var msg = "Error creating image: '" + options.Image + "'";
          callback({error: msg}, {Message: msg});
        });
      });
    } catch (ex) {
      callback({Message: 'Unknown Docker command'}, null);
    }
  }

  public removeContainerByName(containerName:string, cb?:(err:Error, results)=>void) {
    cb = cb || (()=>{});
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
            DockerCommand.docker.getContainer(containerDockerId).remove({force: 1}, (err:Error)=>{
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

  public listContainers(listAllContainers:boolean, cb:(err:Error, containers:any[])=>void) {
    DockerCommand.docker.listContainers({all: listAllContainers}, cb);
  }

  private prettyPrintDockerContainerList(containers, noprint:boolean, all:boolean) {
    console.log('');//Line feed
    if (!containers || !containers.length) {
      if (!noprint) {
        console.log('No ' + (all ? '' : 'Running ') + 'Containers\n');
      }
      return [];
    }
    containers.sort(function (a, b) {
      return (a.Id < b.Id) ? -1 : 1
    });
    let displayContainers = [];
    let ourId = 0;
    containers.forEach(function (container) {
      let ourIdString = (++ourId).toString();
      let displayContainer = {
        ID: ourIdString,
        Name: container.Names[0],
        Image: container.Image,
        DockerId: container.Id.substring(0, 11),
        Status: container.Status
      };
      displayContainers.push(displayContainer);
    });
    if (!noprint) {
      console.table(displayContainers);
    }
    return displayContainers;
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

