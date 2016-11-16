"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const inversify_1 = require("inversify");
const firmament_yargs_1 = require('firmament-yargs');
const path = require('path');
const _ = require('lodash');
let InstallModuleCommandImpl = class InstallModuleCommandImpl {
    constructor(_commandUtil, _spawn) {
        this.aliases = [];
        this.command = '';
        this.commandDesc = '';
        this.handler = (argv) => {
        };
        this.options = {};
        this.subCommands = [];
        this.buildCommandTree();
        this.commandUtil = _commandUtil;
        this.spawn = _spawn;
    }
    buildCommandTree() {
        this.aliases = ['module'];
        this.command = '<subCommand>';
        this.commandDesc = 'Manage firmament modules';
        this.pushInstallModuleCommand();
    }
    pushInstallModuleCommand() {
        let me = this;
        let installModuleCommand = firmament_yargs_1.kernel.get('CommandImpl');
        installModuleCommand.aliases = ['install', 'i'];
        installModuleCommand.commandDesc = 'Install firmament module from NPM repository';
        installModuleCommand.options = {
            name: {
                alias: 'n',
                default: '',
                type: 'string',
                desc: 'Name the firmament module'
            }
        };
        installModuleCommand.handler = (argv) => {
            const modulePrefix = 'firmament-';
            if (!argv.name) {
                me.commandUtil.processExit(1, `\nPlease provide a module name using the '--name <module_name>' switch\n`);
            }
            if (!_.startsWith(argv.name, modulePrefix)) {
                me.commandUtil.processExit(1, `\nModule names must start with '${modulePrefix}'\n`);
            }
            let prefix = path.resolve(__dirname, '../../..');
            let cmd = ['npm', 'install', '--save', '--prefix', `${prefix}`, argv.name];
            me.spawn.sudoSpawn(cmd, (err) => {
                me.commandUtil.processExitWithError(err, `Looks like module '${argv.name}' installed successfully!`);
            });
        };
        me.subCommands.push(installModuleCommand);
    }
};
InstallModuleCommandImpl = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject('CommandUtil')),
    __param(1, inversify_1.inject('Spawn')), 
    __metadata('design:paramtypes', [Object, Object])
], InstallModuleCommandImpl);
exports.InstallModuleCommandImpl = InstallModuleCommandImpl;
//# sourceMappingURL=install-module-command-impl.js.map