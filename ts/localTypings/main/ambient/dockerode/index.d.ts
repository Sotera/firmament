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
    name:string
  }
  
  export interface SpawnOptions{
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
