import {CommandImpl} from 'firmament-yargs';
import {Vita} from "../modules/interfaces/vita";
import {VitaImpl} from "../modules/implementations/vita-impl";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class VitaCommand extends CommandImpl {
  private vita:Vita = new VitaImpl();

  constructor() {
    super();
    log.trace('Constructing Vita instance');
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['vita'];
    this.command = '<subCommand>';
    this.commandDesc = 'Execute VITA commands';
    this.pushVita_run_Command();
  }

  private pushVita_run_Command() {
    let shellCommand = new CommandImpl();
    shellCommand.aliases = ['run'];
    shellCommand.commandDesc = 'Execute VITA run command';
    shellCommand.handler = (argv)=> {
      //noinspection JSUnusedLocalSymbols
      this.vita.run(()=>{
        this.processExit(0);
      });
    };
    this.subCommands.push(shellCommand);
  }
}

