"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firmament_yargs_1 = require('firmament-yargs');
var prep_linux_impl_1 = require('../modules/implementations/prep-linux-impl');
var log = require('jsnlog').JL();
var PrepLinuxCommand = (function (_super) {
    __extends(PrepLinuxCommand, _super);
    function PrepLinuxCommand() {
        _super.call(this);
        log.trace('Constructing PrepLinuxCommand instance');
        this.buildCommandTree();
    }
    PrepLinuxCommand.prototype.buildCommandTree = function () {
        this.aliases = ['linux-prep', 'lp'];
        this.command = '<subCommand>';
        this.commandDesc = 'Prepare new linux instances to work with firmament';
        this.pushShellCommand();
    };
    PrepLinuxCommand.prototype.pushShellCommand = function () {
        var _this = this;
        var shellCommand = new firmament_yargs_1.CommandImpl();
        shellCommand.aliases = ['ubuntu-14.04'];
        shellCommand.commandDesc = 'Prep and Ubuntu v.14.04 machine to run firmament',
            shellCommand.handler = function (argv) {
                _this.processExit(0);
            };
        this.subCommands.push(shellCommand);
    };
    PrepLinuxCommand.prepLinux = new prep_linux_impl_1.PrepLinuxImpl();
    return PrepLinuxCommand;
}(firmament_yargs_1.CommandImpl));
exports.PrepLinuxCommand = PrepLinuxCommand;
//# sourceMappingURL=prepLinuxCommand.js.map