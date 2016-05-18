"use strict";
var spawn = require('child_process').spawn;
var readlineSync = require('readline-sync');
var inpathSync = require('inpath').sync;
var pidof = require('pidof');
var SudoImpl = (function () {
    function SudoImpl() {
    }
    SudoImpl.prototype.spawn = function (cmd, cb) {
        SudoImpl._spawn(cmd, cb);
    };
    SudoImpl.prototype.spawnSync = function (cmd) {
        return SudoImpl._spawnSync(cmd);
    };
    SudoImpl._spawn = function (cmd, cb) {
        var child = SudoImpl._spawnSync(cmd);
        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        child.stdout.on('end', function () {
            cb();
        });
        child.stdout.on('close', function () {
            cb();
        });
        child.stdout.on('error', function () {
            cb(new Error('Something went wrong with spawn'));
        });
    };
    SudoImpl._spawnSync = function (command) {
        var me = this;
        var prompt = '#node-sudo-passwd#';
        var prompts = 0;
        var args = ['-S', '-p', prompt];
        args.push.apply(args, command);
        var bin = command.filter(function (i) {
            return i.indexOf('-') !== 0;
        })[0];
        me.cachedPassword = me.cachedPassword
            || readlineSync.question('sudo requires your password: ', { hideEchoBack: true });
        var child = spawn(me.sudoBin, args, { stdio: 'pipe' });
        child.stderr.on('data', function (data) {
            var lines = data.toString().trim().split('\n');
            lines.forEach(function (line) {
                if (line === prompt) {
                    if (++prompts > 1) {
                        console.log('Bad password, please let\'s try it again.');
                        process.exit(1);
                    }
                    child.stdin.write(me.cachedPassword + '\n');
                }
            });
        });
        pidof(bin, function waitForStartup(err, pid) {
            if (err) {
                throw new Error('Couldn\'t start ' + bin + ' : ' + err.message);
            }
            if (pid || child.exitCode !== null) {
                child.emit('started');
            }
            else {
                setTimeout(pidof(bin, waitForStartup), 100);
            }
        });
        return child;
    };
    SudoImpl.sudoBin = inpathSync('sudo', process.env['PATH'].split(':'));
    return SudoImpl;
}());
exports.SudoImpl = SudoImpl;
//# sourceMappingURL=sudo-impl.js.map