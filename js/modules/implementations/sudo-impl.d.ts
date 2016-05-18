import { Sudo } from '../interfaces/sudo';
export declare class SudoImpl implements Sudo {
    private static cachedPassword;
    private static sudoBin;
    constructor();
    spawn(cmd: string[], cb: (err?: Error) => void): void;
    spawnSync(cmd: string[]): any;
    private static _spawn(cmd, cb);
    private static _spawnSync(command);
}
