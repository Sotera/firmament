import DockerImage = dockerode.DockerImage;
import Container = dockerode.Container;
import ContainerRemoveResults = dockerode.ContainerRemoveResults;
export interface FirmamentDocker {
  createContainer(containerConfig:any, cb:(err:Error, container:Container)=>void);
  startOrStopContainers(ids:string[], start:boolean, cb:()=>void):void;
  listImages(listAllImages:boolean, cb:(err:Error, images:DockerImage[])=>void);
  listContainers(listAllContainers:boolean, cb:(err:Error, containers:Container[])=>void);
  exec(id:string, command:string, cb:(err:Error, result:any)=>void):void;
  getContainer(id:string, cb:(err:Error, container:Container)=>void):void;
  getContainers(ids:string[], cb:(err:Error, containers:Container[])=>void):void;
  removeContainers(ids:string[], cb:(err:Error, containerRemoveResults:ContainerRemoveResults[])=>void):void;
  buildDockerFile(dockerFilePath:string, dockerImageName:string,
                  progressCb:(taskId:string,status:string,current:number,total:number)=>void,
                  cb:(err:Error)=>void):void;
  pullImage(imageName:string,
            progressCb:(taskId:string,status:string,current:number,total:number)=>void,
            cb:(err:Error)=>void);
}
