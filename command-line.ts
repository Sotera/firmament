const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import {Argv} from 'yargs';
class CommandLine {
  private commandLineParser:Argv;

  constructor() {
    this.commandLineParser = require('yargs').help('h');
    this.commandLineParser.alias('h', 'help');
  }

  usage(usageString) {
    this.commandLineParser.usage(usageString);
  }

  demand(count) {
    this.commandLineParser.demand(count);
  }

  one():void {
    this.commandLineParser.count('verbose');
    this.commandLineParser.alias('v', 'verbose');
  }

  two():void {
    this.commandLineParser.count('swinger');
    this.commandLineParser.alias('s', 'swinger');
  }

  exec():void {
    log.info('verbose:' + this.commandLineParser.argv.verbose);
    log.info('swinger:' + this.commandLineParser.argv.swinger);
  }
}
export = CommandLine;
