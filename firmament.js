#!/usr/bin/env node
"use strict";
var log = require('jsnlog').JL();
var CommandLine = require('./command-line');
var commandLine = new CommandLine();
commandLine.usage('Usage: $0 <command> [sub-command] [options]');
commandLine.demand(2);
/*commandLine.one();
commandLine.two();*/
commandLine.exec();
log.fatal('FATAL!');
process.exit(0);
//# sourceMappingURL=firmament.js.map