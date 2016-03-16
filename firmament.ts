#!/usr/bin/env node
const log: JSNLog.JSNLogLogger = require('jsnlog').JL();
import CommandLine = require('./command-line');
var commandLine = new CommandLine();
commandLine.usage('Usage: $0 <command> [sub-command] [options]');
commandLine.demand(2);
/*commandLine.one();
commandLine.two();*/
commandLine.exec();
log.fatal('FATAL!');
process.exit(0);
