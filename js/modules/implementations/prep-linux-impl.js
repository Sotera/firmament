"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firmament_yargs_1 = require('firmament-yargs');
var async = require('async');
var PrepLinuxImpl = (function (_super) {
    __extends(PrepLinuxImpl, _super);
    function PrepLinuxImpl() {
        _super.call(this);
    }
    PrepLinuxImpl.prototype.ubuntu_14_04 = function (argv, cb) {
        var me = this;
        async.series([
            function (cb) {
                me.spawnShellCommand(['/bin/sh', '-c', 'echo "set -o vi" >> ~/.bashrc'], null, cb);
            },
            function (cb) {
                me.spawnShellCommand(['/bin/sh', '-c', 'echo "alias f=\'firmament\'" >> ~/.bashrc'], null, cb);
            },
            function (cb) {
                me.spawnShellCommand(['/bin/sh', '-c', 'echo "alias d=\'docker\'" >> ~/.bashrc'], null, cb);
            },
            function (cb) {
                me.spawnShellCommand(['/bin/sh', '-c', 'echo "set nu" >> ~/.vimrc'], null, cb);
            },
            function (cb) {
                me.sudoSpawn(['ps', '-Fel'], cb);
            }
        ], cb);
    };
    return PrepLinuxImpl;
}(firmament_yargs_1.CommandImpl));
exports.PrepLinuxImpl = PrepLinuxImpl;
//# sourceMappingURL=prep-linux-impl.js.map