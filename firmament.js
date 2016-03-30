#!/usr/bin/env node
"use strict";
var command_line_1 = require('./util/command-line');
var dockerCommand_1 = require("./commands/dockerCommand");
var makeCommand_1 = require('./commands/makeCommand');
//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
var commandLine = new command_line_1.CommandLine();
commandLine.addCommandSpec(new makeCommand_1.MakeCommand());
commandLine.addCommandSpec(new dockerCommand_1.DockerCommand());
commandLine.exec();
//process.exit(0);
//log.fatal('FATAL!');
/*log.fatal('FATAL!');
 process.exit(0);*/
//# sourceMappingURL=firmament.js.map