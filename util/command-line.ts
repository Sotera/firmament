import {Command} from "../commands/command";
//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class CommandLine {
  private cli = require('nested-yargs');
  private app = this.cli.createApp();

  constructor() {
    /*        this.app.command(this.cli.createCommand('init', 'Initialize the this tool.', {
     handler: function (argv) {
     console.dir(argv);
     }
     }));*/
  }

  addCommandSpec(cmd:Command) {
    cmd.aliases.forEach(alias=> {
      let category = this.cli.createCategory(alias, cmd.commandDesc);
      cmd.subCommands.forEach(subCommand=> {
        subCommand.aliases.forEach(alias=> {
          category.command(
            this.cli.createCommand(
              alias,
              subCommand.commandDesc,
              {
                options: subCommand.options,
                handler: subCommand.handler
              }
            )
          );
        });
      });
      this.app.command(category);
    });
  }

  exec() {
    this.cli.run(this.app);
  }
}
