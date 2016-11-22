import {injectable, inject} from "inversify";
import {ModuleManagement} from "../interfaces/ModuleManagement";
import {CommandUtil, Spawn} from "firmament-yargs";
import path = require('path');
import fs = require('fs');
import * as _ from 'lodash';
const which = require('which');

@injectable()
export class ModuleManagementImpl implements ModuleManagement {
  private commandUtil: CommandUtil;
  private spawn: Spawn;

  constructor(@inject('CommandUtil') _commandUtil: CommandUtil,
              @inject('Spawn') _spawn: Spawn) {
    this.commandUtil = _commandUtil;
    this.spawn = _spawn;
  }

  get modulePrefix(): string {
    return 'firmament-';
  }

  installModule(argv: any) {
    let me = this;
    if (!argv.name) {
      me.commandUtil.processExit(1, `\nPlease provide a module name using the '--name <module_name>' switch\n`);
    }
    if (!_.startsWith(argv.name, me.modulePrefix)) {
      me.commandUtil.processExit(1, `\nModule names must start with '${me.modulePrefix}'\n`);
    }
    let prefix = path.resolve(__dirname, '../..');
    let cmd = ['npm', 'install', '--save', '--prefix', `${prefix}`, argv.name];
    me.spawn.spawnShellCommandAsync(cmd, null,
      (err: Error, result: string) => {
        me.commandUtil.stdoutWrite(result);
      },
      (err: Error, result: string) => {
        if (err) {
          //Assume the error was permission related and retry under 'sudo'
          me.spawn.sudoSpawnAsync(cmd, null,
            (err: Error, result: string) => {
              me.commandUtil.stdoutWrite(result);
            },
            (err: Error, result: string) => {
              if (err) {
                me.commandUtil.processExitWithError(err);
              } else {
                me.commandUtil.processExit(0, `Looks like module '${argv.name}' installed successfully!`);
              }
            }
          );
        } else {
          me.commandUtil.processExit(0, `Looks like module '${argv.name}' installed successfully!`);
        }
      }
    );
  }
}
