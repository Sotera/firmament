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
  }

  addCommandSpec(cmd:Command, yargs:Argv = this.commandLineParser) {
    cmd.aliases.forEach(alias=> {
      let command = alias + ' ' + cmd.command;
      if (!cmd.subCommands.length) {
        yargs.command(
          command,
          cmd.commandDesc,
          cmd.builder,
          (argv:Argv)=> {
            cmd.handler(argv);
          })
          .usage(CommandImpl.generalUsage)
          .epilog(CommandImpl.epilog)
          .help('h')
          .alias('h', 'help')
        yargs.argv;
      } else {
        yargs.command(
          command,
          cmd.commandDesc,
          (yargs)=> {
            cmd.subCommands.forEach(subCommand=> {
              this.addCommandSpec(subCommand, yargs);
            });
          }
        );
      }
    });
  }

  exec():Argv {
    this.commandLineParser.demand(1);
    this.commandLineParser.strict();
    this.commandLineParser.help('h');
    this.commandLineParser.alias('help', 'h');
    return this.commandLineParser.argv;
  }
}
