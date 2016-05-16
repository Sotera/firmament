//import {Container, DockerImage, ContainerRemoveResults} from "./dockerode";
export interface PrepLinux {
  tmp(containerConfig:any, cb:(err:Error, container:any)=>void);
}
