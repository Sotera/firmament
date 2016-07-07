export interface PrepLinux {
    ubuntu_14_04(argv: any, cb: (err: Error, result: any) => void): any;
    centos_7(argv: any, cb: (err: Error, result: any) => void): any;
}
