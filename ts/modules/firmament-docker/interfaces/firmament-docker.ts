import DockerImage = dockerode.DockerImage;
export interface FirmamentDocker{
  listImages(listAllImages:boolean, cb:(err:Error, images:DockerImage[])=>void);
}
