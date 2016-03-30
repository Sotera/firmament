#!/usr/bin/env node
//import Argv = yargs.Argv;
import {CommandLine} from './util/command-line';
import {DockerCommand} from "./commands/dockerCommand";
import {MakeCommand} from './commands/makeCommand';
//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
let commandLine = new CommandLine();
commandLine.addCommandSpec(new MakeCommand());
commandLine.addCommandSpec(new DockerCommand());
commandLine.exec();
//process.exit(0);
//log.fatal('FATAL!');
/*log.fatal('FATAL!');
 process.exit(0);*/
