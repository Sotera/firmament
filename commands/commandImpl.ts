const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import {Command} from "./command";
export class CommandImpl implements Command {
  static generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
  static epilog = '** "Let there be light"';
  constructor(){
    this.aliases = [];
    this.subCommands = [];
    this.command = '';
    this.commandDesc = '';
    this.builder = {};
    this.handler = function(argv:yargs.Argv){
      log.debug(argv);
    }
  }
  aliases:string[];
  command:string;
  commandDesc:string;
  builder:any;
  handler:(argv:yargs.Argv)=>void;
  subCommands:Command[];
}

