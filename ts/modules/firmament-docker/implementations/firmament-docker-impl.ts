import * as _ from 'lodash';
import {FirmamentDocker} from "../interfaces/firmament-docker";
import {CommandImpl} from 'firmament-yargs';
import DockerImage = dockerode.DockerImage;
import DockerOde = dockerode.DockerOde;
import Container = dockerode.Container;
const async = require('async');
const deepExtend = require('deep-extend');
const positive = require('positive');
export class FirmamentDockerImpl extends CommandImpl implements FirmamentDocker{
  private dockerode:DockerOde;
  constructor(){
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
}