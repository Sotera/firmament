import {CommandImpl, CommandLineImpl, ProgressBar, ProgressBarImpl} from 'firmament-yargs';
import * as _ from 'lodash';
import ContainerRemoveResults = dockerode.ContainerRemoveResults;
import DockerImage = dockerode.DockerImage;
import Container = dockerode.Container;
import {FirmamentDocker} from "../modules/firmament-docker/interfaces/firmament-docker";
import {FirmamentDockerImpl} from "../modules/firmament-docker/implementations/firmament-docker-impl";
const async = require('async');
const deepExtend = require('deep-extend');
const positive = require('positive');
const childProcess = require('child_process');
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
interface ConsoleEx extends Console {
  table:any
}
declare let console:ConsoleEx;
export class DockerCommand extends CommandImpl {
  private firmamentDocker:FirmamentDocker = new FirmamentDockerImpl();
  static docker = new (require('dockerode'))({socketPath: '/var/run/docker.sock'});
  static progressBar:ProgressBar = new ProgressBarImpl();

  constructor() {
    super();
    log.trace('Constructing DockerCommand instance');
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['docker', 'd'];
    this.command = '<subCommand>';
    this.commandDesc = 'Support for working with Docker containers';
    this.pushImagesCommand();
    this.pushPsCommand();
    this.pushStartCommand();
    this.pushStopCommand();
    this.pushRemoveCommand();
    this.pushShellCommand();
  }

  private pushRemoveCommand() {
    let removeCommand = new CommandImpl();
    removeCommand.aliases = ['rm'];
    removeCommand.commandDesc = 'Remove Docker containers';
    removeCommand.handler = (argv)=> {
      this.firmamentDocker.removeContainers(argv._.slice(2),
        (err:Error, containerRemoveResults:ContainerRemoveResults[])=> {
        this.processExit(0);
      });
    };
    this.subCommands.push(removeCommand);
  }

  private pushShellCommand() {
    let shellCommand = new CommandImpl();
    shellCommand.aliases = ['sh'];
    shellCommand.commandDesc = 'Run bash shell in Docker container',
      shellCommand.handler = (argv)=> {
        this.bashInToContainer(argv._.slice(2), (err:Error, exitCode:number = 0)=> {
          this.processExit(exitCode, err ? err.message : '');
        });
      };
    this.subCommands.push(shellCommand);
  }

  private pushStartCommand() {
    let startCommand = new CommandImpl();
    startCommand.aliases = ['start'];
    startCommand.commandDesc = 'Start Docker containers';
    startCommand.handler = (argv)=> {
      this.firmamentDocker.startOrStopContainers(argv._.slice(2), true, ()=>this.processExit());
    };
    this.subCommands.push(startCommand);
  }

  private pushStopCommand() {
    let stopCommand = new CommandImpl();
    stopCommand.aliases = ['stop'];
    stopCommand.commandDesc = 'Stop Docker containers';
    stopCommand.handler = argv=> {
      this.firmamentDocker.startOrStopContainers(argv._.slice(2), false, ()=>this.processExit());
    };
    this.subCommands.push(stopCommand);
  }

  private pushImagesCommand() {
    let imagesCommand = new CommandImpl();
    imagesCommand.aliases = ['images'];
    imagesCommand.commandDesc = 'List Docker images';
    imagesCommand.options = {
      all: {
        alias: 'a',
        boolean: true,
        default: false,
        desc: 'Show intermediate images also'
      }
    };
    imagesCommand.handler = argv=> this.printImagesList(argv, ()=>this.processExit());
    this.subCommands.push(imagesCommand);
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
    psCommand.handler = argv=> this.printContainerList(argv, ()=>this.processExit());
    this.subCommands.push(psCommand);
  }

  private printImagesList(argv:any, cb:()=>void) {
    this.firmamentDocker.listImages(argv.a, (err, images)=> {
      this.prettyPrintDockerImagesList(err, images, cb);
    });
  }

  private printContainerList(argv:any, cb:()=>void) {
    this.firmamentDocker.listContainers(argv.a, (err, containers)=> {
      this.prettyPrintDockerContainerList(err, containers, argv.a, cb);
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

/*  public removeContainers(containerIds:string[],
                          cb:(err:Error, containerRemoveResults:ContainerRemoveResults[])=>void) {
    let self = this;
    if (!containerIds.length) {
      console.log('Specify containers to remove by FirmamentId, Docker ID or Name. Or "*" to remove all.')
      return;
    }
    if (_.indexOf(containerIds, 'all') !== -1) {
      if (!positive("You're sure you want to remove all containers? [y/N] ", false)) {
        console.log('Operation canceled.')
        cb(null, null);
        return;
      }
      containerIds = null;
    }
    this.firmamentDocker.getContainers(containerIds, (err:Error, containers:any[])=> {
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
  }*/

  private bashInToContainer(ids:string[], cb:(err:Error, exitCode?:number)=>void) {
    if (ids.length !== 1) {
      let msg = '\nSpecify container to shell into by FirmamentId, Docker ID or Name.\n';
      msg += '\nExample: $ ... d sh 2  <= Open bash shell in container with FirmamentId "2"\n';
      cb(new Error(msg));
      return;
    }
    this.firmamentDocker.getContainer(ids[0].toString(), (err:Error, container:Container)=> {
      if (this.callbackIfError(cb, err)) {
        return;
      }
      childProcess.spawnSync('docker', ['exec', '-it', container.name.slice(1), '/bin/bash'], {
        stdio: 'inherit'
      });
      cb(null, 0);
    });
  }

  private prettyPrintDockerImagesList(err:Error, images:any[], cb:()=>void) {
    if (!images || !images.length) {
      let msg = this.returnErrorStringOrMessage(err, '\nNo images\n');
      console.log(msg);
    } else {
      var timeAgo = require('time-ago')();
      var fileSize = require('filesize');
      CommandLineImpl.printTable(images.map(container=> {
        try {
          var ID = container.firmamentId;
          var xxx = container.RepoTags[0].split(':');
          var Repository = xxx[0];
          var Tag = xxx[1];
          var ImageId = container.Id.substring(7, 19);
          var nowTicks = +new Date();
          var tickDiff = nowTicks - (1000 * container.Created);
          var Created = timeAgo.ago(nowTicks - tickDiff);
          var Size = fileSize(container.Size);
        } catch (err) {
          console.log(err.message);
        }
        return {ID, Repository, Tag, ImageId, Created, Size};
      }));
    }
    cb();
  }

  private prettyPrintDockerContainerList(err:Error, containers:any[], all:boolean, cb:()=>void) {
    if (!containers || !containers.length) {
      let msg = this.returnErrorStringOrMessage(err, '\nNo ' + (all ? '' : 'Running ') + 'Containers\n');
      console.log(msg);
    } else {
      CommandLineImpl.printTable(containers.map(container=> {
        return {
          ID: container.firmamentId,
          Name: container.Names[0],
          Image: container.Image,
          DockerId: container.Id.substring(0, 11),
          Status: container.Status
        };
      }));
    }
    cb();
  }
}

