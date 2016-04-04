#!/usr/bin/env node
"use strict";
var command_line_1 = require('./util/command-line');
var makeCommand_1 = require('./commands/makeCommand');
var dockerCommand_1 = require('./commands/dockerCommand');
var log = require('jsnlog').JL();
var commandLine = new command_line_1.CommandLine();
commandLine.addCommandSpec(new makeCommand_1.MakeCommand());
commandLine.addCommandSpec(new dockerCommand_1.DockerCommand());
commandLine.exec();
//# sourceMappingURL=firmament.js.map