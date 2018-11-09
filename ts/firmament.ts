#!/usr/bin/env node
import 'reflect-metadata';
import {Command, CommandLine, kernel} from 'firmament-yargs';
import * as _ from 'lodash';
import {interfaces as container_interfaces} from 'inversify';
import {ModuleManagementCommandImpl} from './implementations/commands/module-management-command-impl';
import {ModuleManagement} from './interfaces/ModuleManagement';
import {ModuleManagementImpl} from './implementations/ModuleManagementImpl';
import {PackageCommandImpl} from './implementations/commands/package-command-impl';
import {Package} from './interfaces/Package';
import {PackageImpl} from './implementations/PackageImpl';

const commandLine = kernel.get<CommandLine>('CommandLine');
const allKernels: container_interfaces.Container[] = [];
const package_json: NpmInfo = require('../package.json');

//Bind internal commands for IoC
kernel.bind<Command>('Command').to(ModuleManagementCommandImpl);
kernel.bind<Command>('Command').to(PackageCommandImpl);
kernel.bind<ModuleManagement>('ModuleManagement').to(ModuleManagementImpl);
kernel.bind<Package>('Package').to(PackageImpl);
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
  let moduleManagement = kernel.get<ModuleManagement>('ModuleManagement');
  let firmamentModules = Object.getOwnPropertyNames(npmInfo.dependencies).filter(key => {
    return _.startsWith(key, moduleManagement.modulePrefix);
  });
  firmamentModules.forEach(moduleName => {
    allKernels.push(require(moduleName).kernel);
  });
  addCommandsFromKernels(allKernels);
  commandLine.exec();
})(package_json);

