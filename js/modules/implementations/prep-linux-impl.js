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
                me.sudoSpawn(['apt-get', 'update'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'install', '-y', 'apt-transport-https', 'ca-certificates'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-key', 'adv', '--keyserver', 'hkp://p80.pool.sks-keyservers.net:80', '--recv-keys',
                    '58118E89F3A912897C070ADBF76221572C52609D'], cb);
            },
            function (cb) {
                me.sudoSpawn(['/bin/sh', '-c',
                    'echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" > /etc/apt/sources.list.d/docker.list'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'update'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-cache', 'policy', 'docker-engine'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'update'], cb);
            },
            function (cb) {
                me.spawnShellCommandAsync(['uname', '-r'], function (err, result) {
                    var uname = result.replace('\n', '');
                    me.sudoSpawn(['apt-get', 'install', '-y', 'linux-image-extra-' + uname], cb);
                });
            },
            function (cb) {
                me.sudoSpawn(['npm', 'install', '-g', 'bower'], cb);
            },
            function (cb) {
                me.sudoSpawn(['npm', 'install', '-g', 'strongloop'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'install', '-y', 'build-essential'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'install', '-y', 'git'], cb);
            },
            function (cb) {
                me.spawnShellCommand(['git', 'config', '--global', 'user.email', '"nobody@nowhere.com"'], null, cb);
            },
            function (cb) {
                me.spawnShellCommand(['git', 'config', '--global', 'user.name', '"nobody"'], null, cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'install', '-y', 'supervisor'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'install', '-y', 'apparmor'], cb);
            },
            function (cb) {
                me.sudoSpawn(['apt-get', 'install', '-y', 'docker-engine'], cb);
            },
            function (cb) {
                me.sudoSpawn(['service', 'docker', 'start'], cb);
            },
            function (cb) {
                me.spawnShellCommandAsync(['whoami'], function (err, result) {
                    var whoami = result.replace('\n', '');
                    me.sudoSpawn(['usermod', '-aG', 'docker', whoami], cb);
                });
            }
        ], cb);
    };
    return PrepLinuxImpl;
}(firmament_yargs_1.CommandImpl));
exports.PrepLinuxImpl = PrepLinuxImpl;
//# sourceMappingURL=prep-linux-impl.js.map