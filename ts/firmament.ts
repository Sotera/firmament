#!/usr/bin/env node
import 'reflect-metadata';
//import {kernel as firmamentDockerKernel} from 'firmament-docker';
import {Command, CommandLine, Spawn, kernel} from 'firmament-yargs';
//let commandLine = firmamentDockerKernel.get<CommandLine>('CommandLine');
import * as _ from 'lodash';
import {interfaces as container_interfaces} from "inversify";
const commandLine = kernel.get<CommandLine>('CommandLine');
const spawn = kernel.get<Spawn>('Spawn');
commandLine.init(
  {
    version: () => {
      return require('../package.json').version;
    }
  }
);
interface NpmInfo {
  dependencies: any
}
function processNpmInfo(npmInfo:NpmInfo){
  let firmamentModules = Object.getOwnPropertyNames(npmInfo.dependencies).filter(key => {
    return _.startsWith(key, 'firmament-');
  });
  firmamentModules.forEach(moduleName => {
    let kernel: container_interfaces.Container = require(moduleName).kernel;
    let commands = kernel.getAll<Command>('Command');
    commands.forEach(command => {
      commandLine.addCommand(command);
    });
  });
  commandLine.exec();
}
processNpmInfo(<NpmInfo>require('../package.json'));
/*spawn.spawnShellCommandAsync(
  ['npm', 'ls', '--json'],
  {
    stdio: 'pipe',
    cwd: require('path').resolve(__dirname, '..')
  },
  (err: Error, result: string) => {
    if (err) {
      console.error(err.message);
      return;
    }
    let npmInfo: NpmInfo = JSON.parse(result);
    processNpmInfo(npmInfo);
  });*/

