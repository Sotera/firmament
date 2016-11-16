import {injectable, inject} from "inversify";
import {Command, CommandUtil, kernel} from 'firmament-yargs';

@injectable()
export class InstallModuleCommandImpl implements Command {
  aliases: string[] = [];
  command: string = '';
  commandDesc: string = '';
  //noinspection JSUnusedGlobalSymbols
  //noinspection JSUnusedLocalSymbols
  handler: (argv: any)=>void = (argv: any)=> {
  };
  options: any = {};
  subCommands: Command[] = [];
  private commandUtil: CommandUtil;

  constructor(@inject('CommandUtil') _commandUtil: CommandUtil){
    this.buildCommandTree();
    this.commandUtil = _commandUtil;
  }

  private buildCommandTree() {
    this.aliases = ['module'];
    this.command = '<subCommand>';
    this.commandDesc = 'Manage firmament modules';
    this.pushInstallModuleCommand();
  }

  private pushInstallModuleCommand() {
    let me = this;
    let installModuleCommand = kernel.get<Command>('CommandImpl');
    installModuleCommand.aliases = ['install', 'i'];
    installModuleCommand.commandDesc = 'Install firmament module from NPM repository';
    //noinspection ReservedWordAsName
    installModuleCommand.options = {
      input: {
        alias: 'i',
        type: 'string',
        desc: 'Name the firmament module'
      }
    };
    installModuleCommand.handler = (argv)=> {
      var a = argv;
    };
    me.subCommands.push(installModuleCommand);
  }
}

/*
 const spawn = kernel.get<Spawn>('Spawn');
 spawn.spawnShellCommandAsync(
 ['npm', 'ls', '--json'],
 {
 stdio: 'pipe',
 cwd: require('path').resolve(__dirname, '..')
 },
 (err: Error, result: string) => {
 if (err) {
 console.error(err.message);
 return;
 }
 let npmInfo: NpmInfo = JSON.parse(result);
 processNpmInfo(npmInfo);
 });*/
