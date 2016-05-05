declare module dockerode {
  export interface ContainerRemoveResults {
    msg:string
  }
  export interface DockerImage {
    RepoTags:string[],
    firmamentId:string
  }
  export interface Container {
    id:string,
    Id:string,
    name:string,
    Status:string,
    firmamentId:string,
    Names:string[]
  }
  export interface SpawnOptions {
    cwd:string,
    stdio:string
  }
  export interface Script {
    RelativeWorkingDir:string,
    Command:string,
    Args:string[]
  }
  export interface ExpressApp {
    GitUrl:string,
    GitSrcBranchName:string,
    StrongLoopBranchName:string,
    StrongLoopServerUrl:string,
    ServiceName:string,
    GitCloneFolder:string,
    Scripts:Script[]
  }
  export interface DockerOde {
    listImages(options:any, cb:(err:Error, images:DockerImage[])=>void):void;
    listContainers(options:any, cb:(err:Error, images:Container[])=>void):void;
    getContainer(id:string):Container;
    buildImage(tarStream:any, options:any, cb:(err:Error, outputStream:any)=>void);
    createContainer(containerConfig:any, cb:(err:Error, container:Container)=>void):void;
    pull(imageName:string, cb:(err:Error, outputStream:any)=>void);
  }
  export interface ContainerConfig {
    name:string,
    Image:string,
    DockerFilePath:string,
    Hostname:string,
    HostConfig:{
      Links:string[],
      PortBindings:{}
    },
    ExpressApps:ExpressApp[]
  }
}
