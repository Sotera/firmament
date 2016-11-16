#!/usr/bin/env node
import 'reflect-metadata';
import {Command, CommandLine, kernel} from 'firmament-yargs';
import * as _ from 'lodash';
import {interfaces as container_interfaces} from "inversify";
import {InstallModuleCommandImpl} from "./implementations/commands/install-module-command-impl";
const commandLine = kernel.get<CommandLine>('CommandLine');
const allKernels: container_interfaces.Container[] = [];
const package_json: NpmInfo = require('../package.json');

//Bind internal commands for IoC
kernel.bind<Command>('Command').to(InstallModuleCommandImpl);
allKernels.push(kernel);

//Allow user to see version of firmament using yargs
commandLine.init(
  {
    version: () => {
      return package_json.version;
    }
  }
);

//Add commands from all kernels in one fell swoop
function addCommandsFromKernels(kernels: container_interfaces.Container[]) {
  kernels.forEach(kernel => {
    let commands = kernel.getAll<Command>('Command');
    commands.forEach(command => {
      commandLine.addCommand(command);
    });
  });
}

//Look at dependencies in our package.json file for modules whose names start with 'firmament-'
(function processNpmInfo(npmInfo: NpmInfo) {
  let firmamentModules = Object.getOwnPropertyNames(npmInfo.dependencies).filter(key => {
    return _.startsWith(key, 'firmament-');
  });
  firmamentModules.forEach(moduleName => {
    allKernels.push(require(moduleName).kernel);
  });
  addCommandsFromKernels(allKernels);
  commandLine.exec();
})(package_json);

