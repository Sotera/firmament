#!/usr/bin/env node
import {CommandLineImpl} from 'firmament-yargs';
import {MakeCommand} from './commands/makeCommand';
import {DockerCommand} from './commands/dockerCommand';
import {PrepLinuxCommand} from "./commands/prepLinuxCommand";
var commandLine = new CommandLineImpl({
  version: ()=>{
    return require('../package.json').version;
  }
});
commandLine.addCommand(new MakeCommand());
commandLine.addCommand(new DockerCommand());
commandLine.addCommand(new PrepLinuxCommand());
commandLine.exec();

