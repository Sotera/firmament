#!/usr/bin/env node
import {CommandLine} from './util/command-line';
import {MakeCommand} from './commands/makeCommand';
import {DockerCommand} from './commands/dockerCommand';
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
var commandLine = new CommandLine();
commandLine.addCommandSpec(new MakeCommand());
/*commandLine.addCommandSpec(new DockerCommand());*/
commandLine.exec();
/*log.fatal('FATAL!');
 process.exit(0);*/
/*let cli = require('nested-yargs');
 let app = cli.createApp();
 app.command(cli.createCommand('init', 'Init your tool', {
 handler: argv=> {
 console.dir(argv);
 }
 }));

 var widgets = cli.createCategory('widgets', 'Manage your inventory of widgets.');

 widgets.command(cli.createCommand('ls', 'List your widgets.', {
 // Options follow the yarg option format 
 options: {
 color: {
 alias: 'c',
 description: 'Only list widgets of the given color.',
 type: 'string',
 }
 },
 handler: function (argv) {
 console.dir(argv);
 }
 }));
 // The ls command is now available at `widgets.commands.ls` 

 // Alias `widgets ls` to the top-level command `widgets ls` 
 app.command(cli.createCommand('ls', widgets.commands.ls.description,
 widgets.commands.ls.options));

 app.command(widgets);

 cli.run(app);*/
