import {injectable, inject} from "inversify";
import {Command, kernel} from 'firmament-yargs';
import {ModuleManagement} from "../../interfaces/ModuleManagement";

@injectable()
export class ModuleManagementCommandImpl implements Command {
  aliases: string[] = [];
  command: string = '';
  commandDesc: string = '';
  //noinspection JSUnusedGlobalSymbols
  //noinspection JSUnusedLocalSymbols
  handler: (argv: any)=>void = (argv: any) => {
  };
  options: any = {};
  subCommands: Command[] = [];
  private moduleManagement: ModuleManagement;

  constructor(@inject('ModuleManagement') _moduleManagement: ModuleManagement) {
    this.moduleManagement = _moduleManagement;
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

