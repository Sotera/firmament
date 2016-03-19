///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import Argv = yargs.Argv;
import {DockerDescriptors} from "../util/docker-descriptors";
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
    var tmp = new DockerDescriptors();
    tmp = new DockerDescriptors();
  };

  private pushTemplateCommand() {
    let templateCommand = new CommandImpl();
    templateCommand.aliases = ['t', 'template'];
    templateCommand.command = '[options]';
    templateCommand.commandDesc = 'Create a template JSON spec for a container cluster';
    templateCommand.builder = {
      out: {
        alias: 'o',
        default: 'firmament.json',
        desc: 'Name the output JSON file'
      },
      full: {
        alias: 'f',
        boolean: true,
        default: false,
        desc: 'Create a full JSON template with all Docker options set to reasonable defaults'
      }
    };
    templateCommand.handler = (argv:yargs.Argv)=> this.makeTemplate(argv);
    this.subCommands.push(templateCommand);
  };

  private pushBuildCommand() {
    let buildCommand = new CommandImpl();
    buildCommand.aliases = ['b', 'build'];
    buildCommand.commandDesc = 'Build Docker containers based on JSON spec'
    buildCommand.handler = (argv:yargs.Argv)=> this.buildTemplate(argv);
    this.subCommands.push(buildCommand);
  };

  private buildTemplate(argv:any) {
    log.error('Building the Template!');
  }

  private makeTemplate(argv:any) {
    if (argv._.length > 1) {
      throw new Error('Too many non-option arguments');
    }
    const jsonFileExtension = '.json';
    let path = require('path');
    let cwd = process.cwd();
    let outFilename:string = argv.out;
    let regex = new RegExp('(.*)\\' + jsonFileExtension + '$', 'i');
    if (regex.test(outFilename)) {
      outFilename = outFilename.replace(regex, '$1' + jsonFileExtension);
    } else {
      outFilename = outFilename + jsonFileExtension;
    }
    let fullOutPath = path.resolve(cwd, outFilename);
    var fs = require('fs');
    if (fs.existsSync(fullOutPath)) {
      var positive = require('positive');
      if (positive("Config file '" + fullOutPath + "' already exists. Overwrite? [Y/n]", true)) {
        this.writeJsonTemplateFile(fullOutPath, argv.full);
      } else {
        console.log('Canceling JSON template creation!');
      }
      return;
    }
    this.writeJsonTemplateFile(fullOutPath, argv.full);
  }

  private writeJsonTemplateFile(fullOutPath:string, writeFullTemplate:boolean) {
    console.log("Writing JSON template file '" + fullOutPath + "' ...");
    let objectToWrite = writeFullTemplate
      ? DockerDescriptors.dockerContainerDefaultTemplate
      : DockerDescriptors.dockerContainerConfigTemplate;
    var jsonFile = require('jsonfile');
    jsonFile.spaces = 2;
    jsonFile.writeFileSync(fullOutPath, objectToWrite);
  }
}

