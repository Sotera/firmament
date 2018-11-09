import {injectable, inject} from 'inversify';
import {Command, kernel} from 'firmament-yargs';
import {ModuleManagement} from '../../interfaces/ModuleManagement';

@injectable()
export class ModuleManagementCommandImpl implements Command {
  aliases: string[] = [];
  command: string = '';
  commandDesc: string = '';
  //noinspection JSUnusedGlobalSymbols
  handler: (argv: any)=>void = () => {
  };
  //noinspection JSUnusedGlobalSymbols
  options: any = {};
  subCommands: Command[] = [];

  constructor(@inject('ModuleManagement') private moduleManagement: ModuleManagement) {
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['module'];
    this.command = '<subCommand>';
    this.commandDesc = 'Manage firmament modules';
    this.pushInstallModuleCommand();
  }

  private pushInstallModuleCommand() {
    let me = this;
    let installModuleCommand = kernel.get<Command>('CommandImpl');
    installModuleCommand.aliases = ['install', 'i'];
    installModuleCommand.commandDesc = 'Install firmament module from NPM repository';
    //noinspection ReservedWordAsName
    installModuleCommand.options = {
      name: {
        alias: 'n',
        default: '',
        type: 'string',
        desc: 'Name the firmament module'
      }
    };
    installModuleCommand.handler = me.moduleManagement.installModule.bind(me.moduleManagement);
    me.subCommands.push(installModuleCommand);
  }
}

