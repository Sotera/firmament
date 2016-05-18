import { PrepLinux } from '../interfaces/prep-linux';
import { CommandImpl } from 'firmament-yargs';
export declare class PrepLinuxImpl extends CommandImpl implements PrepLinux {
    private sudo;
    constructor();
    ubuntu_14_04(argv: any, cb: (err: Error, result: any) => void): void;
    spawn(cmd: string[], cb: (err?: Error) => void): void;
    sudoSpawn(cmd: string[], cb: (err?: Error) => void): void;
}
