export interface PrepLinux {
    tmp(containerConfig: any, cb: (err: Error, container: any) => void): any;
}
