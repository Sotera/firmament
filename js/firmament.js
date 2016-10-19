#!/usr/bin/env node
"use strict";
var firmament_yargs_1 = require('firmament-yargs');
var makeCommand_1 = require('./commands/makeCommand');
var dockerCommand_1 = require('./commands/dockerCommand');
var prepLinuxCommand_1 = require("./commands/prepLinuxCommand");
var vitaCommand_1 = require("./commands/vitaCommand");
var commandLine = new firmament_yargs_1.CommandLineImpl({
    version: function () {
        return require('../package.json').version;
    }
});
commandLine.addCommand(new makeCommand_1.MakeCommand());
commandLine.addCommand(new dockerCommand_1.DockerCommand());
commandLine.addCommand(new prepLinuxCommand_1.PrepLinuxCommand());
commandLine.addCommand(new vitaCommand_1.VitaCommand());
commandLine.exec();
//# sourceMappingURL=firmament.js.map