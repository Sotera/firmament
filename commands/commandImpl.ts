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
    this.handler = function(argv:any){
      log.debug(argv);
    }
  }
  aliases:string[];
  command:string;
  commandDesc:string;
  builder:any;
  handler:(argv:any)=>void;
  subCommands:Command[];
}

