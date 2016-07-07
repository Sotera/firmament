import { PrepLinux } from '../interfaces/prep-linux';
import { CommandImpl } from 'firmament-yargs';
export declare class PrepLinuxImpl extends CommandImpl implements PrepLinux {
    constructor();
    centos_7(argv: any, cb: (err: Error, result: any) => void): void;
    ubuntu_14_04(argv: any, cb: (err: Error, result: any) => void): void;
}
