const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import {Command} from "./command";
export class CommandImpl implements Command {
  static generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
  static epilog = '** "Let there be light"';

  constructor() {
    this.aliases = [];
    this.subCommands = [];
    this.command = '';
    this.commandDesc = '';
    this.options = {};
    this.handler = function (argv:any) {
      log.debug(argv);
    }
  }

  aliases:string[];
  command:string;
  commandDesc:string;
  options:any;
  handler:(argv:any)=>void;
  subCommands:Command[];

  protected returnErrorStringOrMessage(err:Error, message:string) {
    let errorMessage = this.logError(err, false);
    return errorMessage.length ? errorMessage : message;
  }

  protected logError(err:Error, writeErrorToConsole:boolean = true):string {
    if (err) {
      if (writeErrorToConsole) {
        log.error(err.message);
      }
      return err.message;
    }
    return '';
  }

  protected processExit(exitCode:number = 0, msg:string = '') {
    console.log(msg);
    process.exit(exitCode);
  }

  protected logAndCallback(msg:string,
                           cb:(err:Error, result:any)=>void,
                           err:Error = null,
                           result:any = null) {
    console.log(msg);
    if (cb && (typeof cb === 'function')) {
      cb(err, result);
    }
  }
}

