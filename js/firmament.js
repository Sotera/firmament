#!/usr/bin/env node
"use strict";
require('reflect-metadata');
const firmament_yargs_1 = require('firmament-yargs');
const _ = require('lodash');
const install_module_command_impl_1 = require("./implementations/commands/install-module-command-impl");
const commandLine = firmament_yargs_1.kernel.get('CommandLine');
const allKernels = [];
const package_json = require('../package.json');
firmament_yargs_1.kernel.bind('Command').to(install_module_command_impl_1.InstallModuleCommandImpl);
allKernels.push(firmament_yargs_1.kernel);
commandLine.init({
    version: () => {
        return package_json.version;
    }
});
function addCommandsFromKernels(kernels) {
    kernels.forEach(kernel => {
        let commands = kernel.getAll('Command');
        commands.forEach(command => {
            commandLine.addCommand(command);
        });
    });
}
(function processNpmInfo(npmInfo) {
    let firmamentModules = Object.getOwnPropertyNames(npmInfo.dependencies).filter(key => {
        return _.startsWith(key, 'firmament-');
    });
    firmamentModules.forEach(moduleName => {
        allKernels.push(require(moduleName).kernel);
    });
    addCommandsFromKernels(allKernels);
    commandLine.exec();
})(package_json);
//# sourceMappingURL=firmament.js.map