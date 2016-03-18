///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import Argv = yargs.Argv;
import {Command} from "./command";
export class MakeCommand extends CommandImpl {
  constructor() {
    super();
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['m', 'make'];
    this.command = '<subCommand>';
    this.commandDesc = 'Support for building Docker container clusters';
    this.pushBuildCommand();
    this.pushTemplateCommand();
  };

  private pushTemplateCommand() {
    let templateCommand = new CommandImpl();
    templateCommand.aliases = ['t', 'template'];
    templateCommand.command = '[options]';
    templateCommand.commandDesc = 'Create a template JSON spec for a container cluster';
    templateCommand.builder = {
      out: {
        alias: 'o',
        default: 'firmament.json'
      },
      full: {
        alias: 'f',
        boolean: true,
        default: false,
        desc: 'banana'
      }
    };
    templateCommand.handler = function (argv:yargs.Argv) {
      log.debug(JSON.stringify(argv));
    }
    this.subCommands.push(templateCommand);
  };

  private pushBuildCommand() {
    let buildCommand = new CommandImpl();
    buildCommand.aliases = ['b', 'build'];
    buildCommand.commandDesc = 'Build Docker containers based on JSON spec'
    buildCommand.handler = function (argv:yargs.Argv) {
      log.debug('Make Build Me!');
    }
    this.subCommands.push(buildCommand);
  };

  private makeTemplate(filename, options, callback) {
    log.info("\nCreating JSON template file '" + filename + "' ...");
    var fs = require('fs');
    if (fs.existsSync(filename)) {
      var positive = require('positive');
      if (positive("Config file '" + filename + "' already exists. Overwrite? [Y/n]", true)) {
        log.error('Overwriting!');
      } else {
        log.error('Canceling!');
      }
    }
    /*
     if (fs.existsSync(filename)) {
     var yesno = requireCache('yesno');
     yesno.ask("Config file '" + filename + "' already exists. Overwrite? [Y/n]", true, function (ok) {
     if (ok) {
     util_CallFunctionInFiber(function (callback) {
     util_WriteTemplateFile(filename, options.full, callback);
     }, [], callback);
     } else {
     callback({Message: 'Canceled'});
     }
     });
     } else {
     util_WriteTemplateFile(filename, options.full, callback);
     }
     */
  }
}

