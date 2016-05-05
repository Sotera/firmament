import * as _ from 'lodash';
import {FirmamentDocker} from "../interfaces/firmament-docker";
import {CommandImpl} from 'firmament-yargs';
import DockerImage = dockerode.DockerImage;
import DockerOde = dockerode.DockerOde;
import Container = dockerode.Container;
const async = require('async');
const deepExtend = require('deep-extend');
const positive = require('positive');
const childProcess = require('child_process');
export class FirmamentDockerImpl extends CommandImpl implements FirmamentDocker {
  private dockerode:DockerOde;

  constructor() {
    super();
    this.dockerode = new (require('dockerode'))({socketPath: '/var/run/docker.sock'});
  }

  createContainer(containerConfig:any, cb:(err:Error, container:dockerode.Container)=>void) {
    var fullContainerConfigCopy = {ExpressApps: []};
    deepExtend(fullContainerConfigCopy, containerConfig);
    this.dockerode.createContainer(fullContainerConfigCopy, (err:Error, container:any)=> {
      cb(err, container);
    });
  }

  removeContainers(ids:string[], cb:(err:Error, containerRemoveResults:dockerode.ContainerRemoveResults[])=>void):void {
    let self = this;
    if (!ids.length) {
      console.log('Specify containers to remove by FirmamentId, Docker ID or Name. Or "*" to remove all.');
      return;
    }
    if (_.indexOf(ids, 'all') !== -1) {
      if (!positive("You're sure you want to remove all containers? [y/N] ", false)) {
        console.log('Operation canceled.');
        cb(null, null);
        return;
      }
      ids = null;
    }
    this.getContainers(ids, (err:Error, containers:any[])=> {
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

  startOrStopContainers(ids:string[], start:boolean, cb:()=>void):void {
    this.getContainers(ids, (err:Error, containers:Container[])=> {
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

  getContainers(ids:string[], cb:(err:Error, containers:Container[])=>void):void {
    if (!ids) {
      this.listContainers(true, (err:Error, containers:Container[])=> {
        if (this.callbackIfError(cb, err)) {
          return;
        }
        ids = [];
        containers.forEach(container=> {
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
        cb(err, results.filter(result=>!!result));
      }
    });
  }

  getContainer(id:string, cb:(err:Error, container:Container)=>void) {
    let self = this;
    async.waterfall([
        (cb:(err:Error)=>void)=> {
          self.listContainers(true, cb);
        },
        (containers:Container[], cb:(err:Error, container:Container|string)=>void)=> {
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
            let containerObject = this.dockerode.getContainer(foundContainers[0].Id);
            containerObject.name = foundContainers[0].Names[0];
            cb(null, containerObject);
          } else {
            cb(null, 'Unable to find container: "' + id + '"');
          }
        }
      ],
      cb);
  }

  exec(id:string, command:string, cb:(err:Error, result:any)=>void):void {
    this.getContainer(id, (err:Error, container:Container)=> {
      if (this.callbackIfError(cb, err)) {
        return;
      }
      childProcess.spawnSync('docker', ['exec', '-it', container.name.slice(1), command], {
        stdio: 'inherit'
      });
      cb(null, 0);
    });
  }

  listContainers(listAllContainers:boolean, cb:(err:Error, containers?:Container[])=>void) {
    this.dockerode.listContainers({all: true}, (err:Error, allContainers:Container[])=> {
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
        return !!container;
      });
      cb(null, containers);
    });
  }

  listImages(listAllImages:boolean, cb:(err:Error, images:dockerode.DockerImage[])=>void) {
    this.dockerode.listImages({all: listAllImages}, (err:Error, images:DockerImage[])=> {
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

  buildDockerFile(dockerFilePath:string, dockerImageName:string,
                  progressCb:(taskId:string, status:string, current:number, total:number)=>void,
                  cb:(err:Error)=>void):void {
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
      this.dockerode.buildImage(tarStream, {
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
              progressCb(data.id,
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

  pullImage(imageName:string,
            progressCb:(taskId:string, status:string, current:number, total:number)=>void,
            cb:(err:Error)=>void) {
    this.dockerode.pull(imageName,
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
              progressCb(data.id,
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
}