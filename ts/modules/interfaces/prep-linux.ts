//import {Container, DockerImage, ContainerRemoveResults} from "./dockerode";
export interface PrepLinux {
  ubuntu_14_04(argv:any, cb:(err:Error, result:any)=>void);
  centos_6(argv:any, cb:(err:Error, result:any)=>void);
}
