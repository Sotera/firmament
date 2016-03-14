#!/usr/bin/env node
var log: JSNLog.JSNLogLogger = require('jsnlog').JL();
import CommandLine = require('./command-line');
var commandLine = new CommandLine();
process.exit(0);
