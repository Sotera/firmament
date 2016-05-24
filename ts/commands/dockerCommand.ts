import {CommandImpl, CommandLineImpl, ProgressBar, ProgressBarImpl} from 'firmament-yargs';
import {FirmamentDocker, FirmamentDockerImpl, DockerImage} from "firmament-docker";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
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
    this.pushCleanVolumesCommand();
    this.pushImagesCommand();
    this.pushPsCommand();
    this.pushStartCommand();
    this.pushStopCommand();
    this.pushRemoveContainersCommand();
    this.pushRemoveImagesCommand();
    this.pushShellCommand();
  }

  private pushCleanVolumesCommand() {
    let me = this;
    let cleanVolumesCommand = new CommandImpl();
    cleanVolumesCommand.aliases = ['clean-volumes', 'cv'];
    cleanVolumesCommand.commandDesc = 'Clean orphaned Docker resources';
    cleanVolumesCommand.handler = (argv)=> {
      var script = require('path').join(__dirname, '../../legacy/_docker-cleanup-volumes.sh');
      me.sudoSpawn([ '/bin/bash', '-c', script ], (err:Error)=>{
        me.processExitWithError(err);
      });
    };
    this.subCommands.push(cleanVolumesCommand);
  }

  private pushRemoveImagesCommand() {
    let removeCommand = new CommandImpl();
    removeCommand.aliases = ['rmi'];
    removeCommand.commandDesc = 'Remove Docker images';
    removeCommand.handler = (argv)=> {
      this.firmamentDocker.removeImages(argv._.slice(2), (err:Error)=> {
        this.processExitWithError(err);
      });
    };
    this.subCommands.push(removeCommand);
  }

  private pushRemoveContainersCommand() {
    let removeCommand = new CommandImpl();
    removeCommand.aliases = ['rm'];
    removeCommand.commandDesc = 'Remove Docker containers';
    removeCommand.handler = (argv)=> {
      this.firmamentDocker.removeContainers(argv._.slice(2),
        (err:Error)=> {
          this.processExitWithError(err);
        });
    };
    this.subCommands.push(removeCommand);
  }

  private pushShellCommand() {
    let shellCommand = new CommandImpl();
    shellCommand.aliases = ['sh'];
    shellCommand.commandDesc = 'Run bash shell in Docker container';
    shellCommand.handler = (argv)=> {
      this.bashInToContainer(argv._.slice(2), (err:Error)=> {
        this.processExitWithError(err);
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
    //noinspection ReservedWordAsName
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
    //noinspection ReservedWordAsName
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

  private bashInToContainer(ids:string[], cb:(err:Error)=>void) {
    if (ids.length !== 1) {
      let msg = '\nSpecify container to shell into by FirmamentId, Docker ID or Name.\n';
      msg += '\nExample: $ ... d sh 2  <= Open bash shell in container with FirmamentId "2"\n';
      cb(new Error(msg));
      return;
    }
    this.firmamentDocker.exec(ids[0].toString(), '/bin/bash', cb);
  }

  private prettyPrintDockerImagesList(err:Error, images:DockerImage[], cb:()=>void) {
    if (!images || !images.length) {
      let msg = this.returnErrorStringOrMessage(err, '\nNo images\n');
      console.log(msg);
    } else {
      var timeAgo = require('time-ago')();
      var fileSize = require('filesize');
      CommandLineImpl.printTable(images.map(image=> {
        try {
          var ID = image.firmamentId;
          var repoTags = image.RepoTags[0].split(':');
          var Repository = repoTags[0];
          var Tag = repoTags[1];
          var ImageId = image.Id.substring(7, 19);
          var nowTicks = +new Date();
          var tickDiff = nowTicks - (1000 * image.Created);
          var Created = timeAgo.ago(nowTicks - tickDiff);
          var Size = fileSize(image.Size);
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

