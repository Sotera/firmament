import Argv = yargs.Argv;
import {Command} from "../commands/command";
import {CommandImpl} from "../commands/commandImpl";
//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class CommandLine {
  private commandLineParser:yargs.Argv;

  constructor() {
    this.commandLineParser = require('yargs');
    this.commandLineParser.epilog(CommandImpl.epilog);
    this.commandLineParser.usage(CommandImpl.generalUsage);
    this.commandLineParser.help();
    this.commandLineParser.alias('help', 'h');
  }

  addCommandSpec(cmd:Command, yargs:Argv = this.commandLineParser) {
    cmd.aliases.forEach(alias=> {
      let command = alias + ' ' + cmd.command;
      if (!cmd.subCommands.length) {
        yargs.command(
          command,
          cmd.commandDesc,
          cmd.builder,
          cmd.handler);
      } else {
        yargs.command(
          command,
          cmd.commandDesc,
          (yargs)=> {
            cmd.subCommands.forEach(subCommand=> {
              this.addCommandSpec(subCommand, yargs);
            });
            yargs.help();
            //yargs.alias('help', 'h');
            yargs.argv;
          }
        );
      }
    });
    /*    yargs.help('h');
     yargs.alias('h', 'help');*/
    //noinspection BadExpressionStatementJS
    //yargs.argv;
  }

  exec():Argv {
    return this.commandLineParser.argv;
  }
}
