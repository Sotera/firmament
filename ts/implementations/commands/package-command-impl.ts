import {injectable, inject} from 'inversify';
import {Command, kernel} from 'firmament-yargs';
import {Package} from '../../interfaces/Package';

@injectable()
export class PackageCommandImpl implements Command {
  aliases: string[] = [];
  command: string = '';
  commandDesc: string = '';
  //noinspection JSUnusedGlobalSymbols
  handler: (argv: any) => void = () => {
  };
  //noinspection JSUnusedGlobalSymbols
  options: any = {};
  subCommands: Command[] = [];

  constructor(@inject('Package') private _package: Package) {
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['package'];
    this.command = '<subCommand>';
    this.commandDesc = `Package this firmament as 'tar' archive and optionally scp to another host`;
    this.pushInstallModuleCommand();
  }

  private pushInstallModuleCommand() {
    const me = this;
    const packageCommand = kernel.get<Command>('CommandImpl');
    packageCommand.aliases = ['tar'];
    packageCommand.commandDesc = `Use 'tar' to package this firmament`;
    //noinspection ReservedWordAsName
    packageCommand.options = {
      output: {
        alias: 'o',
        default: `${process.cwd()}/_firmament.tar.gz`,
        type: 'string',
        desc: 'Path that firmament tar archive will be written to'
      }
    };
    packageCommand.handler = me._package.tar.bind(me._package);
    me.subCommands.push(packageCommand);
  }
}

