import { Command, CommandUtil, Spawn } from 'firmament-yargs';
export declare class InstallModuleCommandImpl implements Command {
    aliases: string[];
    command: string;
    commandDesc: string;
    handler: (argv: any) => void;
    options: any;
    subCommands: Command[];
    private commandUtil;
    private spawn;
    constructor(_commandUtil: CommandUtil, _spawn: Spawn);
    private buildCommandTree();
    private pushInstallModuleCommand();
}
