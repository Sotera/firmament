#!/usr/bin/env node
"use strict";
require('reflect-metadata');
const firmament_docker_1 = require('firmament-docker');
let commandLine = firmament_docker_1.kernel.get('CommandLine');
commandLine.init({
    version: () => {
        return require('../package.json').version;
    }
});
let dockerCommand = firmament_docker_1.kernel.get('DockerCommand');
commandLine.addCommand(dockerCommand);
let makeCommand = firmament_docker_1.kernel.get('MakeCommand');
commandLine.addCommand(makeCommand);
commandLine.exec();
//# sourceMappingURL=firmament.js.map