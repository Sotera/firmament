import {CommandImpl} from 'firmament-yargs';
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class VersionCommand extends CommandImpl {

  constructor() {
    super();
    log.trace('Constructing VersionCommand instance');
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.commandDesc = 'Display firmament version.';
    this.options = {
      get: {
        alias: 'g',
        type: 'string',
        desc: 'Get a container cluster template from GitHub (use -ls to list available templates)'
      },
      ls: {
        type: 'boolean',
        default: false,
        desc: 'List available Docker container cluster templates'
      },
      full: {
        alias: 'f',
        type: 'boolean',
        default: false,
        desc: 'Create a full JSON template with all Docker options set to reasonable defaults'
      }
    };
    this.handler = (argv)=>{
      console.log('v.3.9.3');
      this.processExit();
    }
  }
}


