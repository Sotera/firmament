#!/usr/bin/env node
"use strict";
require('reflect-metadata');
const firmament_yargs_1 = require('firmament-yargs');
const _ = require('lodash');
const commandLine = firmament_yargs_1.kernel.get('CommandLine');
const spawn = firmament_yargs_1.kernel.get('Spawn');
commandLine.init({
    version: () => {
        return require('../package.json').version;
    }
});
function processNpmInfo(npmInfo) {
    let firmamentModules = Object.getOwnPropertyNames(npmInfo.dependencies).filter(key => {
        return _.startsWith(key, 'firmament-');
    });
    firmamentModules.forEach(moduleName => {
        let kernel = require(moduleName).kernel;
        let commands = kernel.getAll('Command');
        commands.forEach(command => {
            commandLine.addCommand(command);
        });
    });
    commandLine.exec();
}
processNpmInfo(require('../package.json'));
//# sourceMappingURL=firmament.js.map