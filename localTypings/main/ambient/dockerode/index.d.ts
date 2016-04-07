declare module dockerode {
  export interface ContainerRemoveResults {
    msg:string
  }
  export interface DockerImage {
    RepoTags:string[],
    firmamentId:string
  }
  export interface Container {
    id:string
  }
  export interface ContainerConfig {
    name:string,
    Image:string,
    DockerFilePath:string
  }
}
