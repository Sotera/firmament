import {FirmamentDocker} from "../interfaces/firmament-docker";
import {CommandImpl} from 'firmament-yargs';
import DockerImage = dockerode.DockerImage;
import DockerOde = dockerode.DockerOde;
export class FirmamentDockerImpl extends CommandImpl implements FirmamentDocker{
  private dockerode:DockerOde;
  constructor(){
    super();
    this.dockerode = new (require('dockerode'))({socketPath: '/var/run/docker.sock'});
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