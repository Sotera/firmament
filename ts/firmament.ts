#!/usr/bin/env node
import 'reflect-metadata';
import {kernel as firmamentDockerKernel} from 'firmament-docker';
import {Command, CommandLine} from 'firmament-yargs';
let commandLine = firmamentDockerKernel.get<CommandLine>('CommandLine');
commandLine.init(
  {
    version: ()=> {
      return require('../package.json').version;
    }
  }
);
let dockerCommand = firmamentDockerKernel.get<Command>('DockerCommand');
commandLine.addCommand(dockerCommand);
let makeCommand = firmamentDockerKernel.get<Command>('MakeCommand');
commandLine.addCommand(makeCommand);
commandLine.exec();

