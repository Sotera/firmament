#!/usr/bin/env node
import Argv = yargs.Argv;
import {CommandLine} from './util/command-line';
import {MakeCommand} from './commands/makeCommand';
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
var commandLine = new CommandLine();
//
commandLine.addCommandSpec(new MakeCommand());
commandLine.exec();
log.fatal('FATAL!');
process.exit(0);
