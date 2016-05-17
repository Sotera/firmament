import {CommandImpl} from 'firmament-yargs';
import {PrepLinux} from '../modules/interfaces/prep-linux';
import {PrepLinuxImpl} from '../modules/implementations/prep-linux-impl';
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class PrepLinuxCommand extends CommandImpl {
  private prepLinux:PrepLinux = new PrepLinuxImpl();

  constructor() {
    super();
    log.trace('Constructing PrepLinuxCommand instance');
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['linux-prep', 'lp'];
    this.command = '<subCommand>';
    this.commandDesc = 'Prepare new linux instances to work with firmament';
    this.pushShellCommand();
  }

  private pushShellCommand() {
    let shellCommand = new CommandImpl();
    shellCommand.aliases = ['ubuntu-14.04'];
    shellCommand.commandDesc = 'Prep and Ubuntu v.14.04 machine to run firmament';
    shellCommand.handler = (argv)=> {
      //noinspection JSUnusedLocalSymbols
      this.prepLinux.ubuntu_14_04(argv, (err:Error, result:string[])=>{
        this.processExitWithError(err);
      });
    };
    this.subCommands.push(shellCommand);
  }
}


