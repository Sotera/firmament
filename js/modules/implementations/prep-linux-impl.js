"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firmament_yargs_1 = require('firmament-yargs');
var sudo_impl_1 = require('../implementations/sudo-impl');
var async = require('async');
var PrepLinuxImpl = (function (_super) {
    __extends(PrepLinuxImpl, _super);
    function PrepLinuxImpl() {
        _super.call(this);
        this.sudo = new sudo_impl_1.SudoImpl();
    }
    PrepLinuxImpl.prototype.ubuntu_14_04 = function (argv, cb) {
        var me = this;
        async.series([
            function (cb) {
                me.spawn(['-c', 'echo "set -o vi" >> ~/.bashrc'], cb);
            },
            function (cb) {
                me.spawn(['-c', 'echo "alias f=\'firmament\'" >> ~/.bashrc'], cb);
            },
            function (cb) {
                me.spawn(['-c', 'echo "alias d=\'docker\'" >> ~/.bashrc'], cb);
            },
            function (cb) {
                me.spawn(['-c', 'echo "set nu" >> ~/.vimrc'], cb);
            },
            function (cb) {
                me.sudoSpawn(['ps', '-Fel'], cb);
            }
        ], cb);
    };
    PrepLinuxImpl.prototype.spawn = function (cmd, cb) {
        this.spawnShellCommand('sh', cmd, null, cb);
    };
    PrepLinuxImpl.prototype.sudoSpawn = function (cmd, cb) {
        this.sudo.spawn(cmd, cb);
    };
    return PrepLinuxImpl;
}(firmament_yargs_1.CommandImpl));
exports.PrepLinuxImpl = PrepLinuxImpl;
//# sourceMappingURL=prep-linux-impl.js.map