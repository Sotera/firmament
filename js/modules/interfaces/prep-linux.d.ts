export interface PrepLinux {
    ubuntu_14_04(argv: any, cb: (err: Error, result: any) => void): any;
    centos_6(argv: any, cb: (err: Error, result: any) => void): any;
}
