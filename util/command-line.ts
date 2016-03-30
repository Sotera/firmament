import {Command} from "../commands/command";
import {CommandImpl} from "../commands/commandImpl";
//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class CommandLine {
    private cli = require('nested-yargs');
    private app = this.cli.createApp();

    constructor() {
        this.app.command(this.cli.createCommand('init', 'Initialize the this tool.', {
            handler: function (argv) {
                console.dir(argv);
            }
        }));
    }

    addCommandSpec(cmd:Command) {
        cmd.aliases.forEach(alias=>{
            let category = this.cli.createCategory(alias, cmd.commandDesc);
            cmd.subCommands.forEach(subCommand=> {
                subCommand.aliases.forEach(alias=>{
                    category.command(
                        this.cli.createCommand(
                            alias,
                            subCommand.commandDesc,
                            {
                                options:{
                                    color:{
                                        alias: 'c',
                                        description: 'Color me orange',
                                        type: 'string'
                                    }
                                },
                                function(argv){
                                    console.dir(argv);
                                }
                            }
                        )
                    );
                });
            });
            this.app.command(category);
        });
    }

    /*    addCommandSpec(cmd:Command, yargs:any = this.commandLineParser) {
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
     yargs.argv;
     }
     );
     }
     });
     }*/

    exec() {
        this.cli.run(this.app);
    }
}
