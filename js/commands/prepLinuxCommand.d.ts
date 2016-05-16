import { CommandImpl } from 'firmament-yargs';
import { PrepLinux } from '../modules/interfaces/prep-linux';
export declare class PrepLinuxCommand extends CommandImpl {
    static prepLinux: PrepLinux;
    constructor();
    private buildCommandTree();
    private pushShellCommand();
}
