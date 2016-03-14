var log: JSNLog.JSNLogLogger = require('jsnlog').JL();

class CommandLine{
  constructor(){
    log.info('Constructed CommandLine object!');
  }
}

export = CommandLine;
