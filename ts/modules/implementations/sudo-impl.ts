import {Sudo} from '../interfaces/sudo';
const spawn = require('child_process').spawn;
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
export class SudoImpl implements Sudo {
  private cachedPassword:string;
  private sudoBin:string;

  constructor() {
    var path = process.env['PATH'].split(':');
    this.sudoBin = inpathSync('sudo', path);
  }

  spawnSync(command:string[], options:any) {
    var me = this;
    var prompt = '#node-sudo-passwd#';
    var prompts = 0;
    var args = ['-S', '-p', prompt];
    args.push.apply(args, command);
    // The binary is the first non-dashed parameter to sudo
    var bin = command.filter(function (i) {
      return i.indexOf('-') !== 0;
    })[0];
    var options = options || {};
    var spawnOptions = options.spawnOptions || {};
    var userPrompt = options.prompt || 'sudo requires your password: ';
    var password = readlineSync.question(userPrompt, {hideEchoBack: true});
    spawnOptions.stdio = 'pipe';
    var child = spawn(me.sudoBin, args, spawnOptions);
    // Wait for the sudo:d binary to start up
    function waitForStartup(err, pid) {
      if (err) {
        throw new Error('Couldn\'t start ' + bin);
      }
      if (pid || child.exitCode !== null) {
        child.emit('started');
      } else {
        setTimeout(function () {
          pidof(bin, waitForStartup);
        }, 100);
      }
    }

    pidof(bin, waitForStartup);
    // FIXME: Remove this handler when the child has successfully started
    child.stderr.on('data', function (data) {
      var lines = data.toString().trim().split('\n');
      lines.forEach(function (line) {
        if (line === prompt) {
          if (++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            me.cachedPassword = null;
          }
          if (options.cachePassword && me.cachedPassword) {
            child.stdin.write(me.cachedPassword + '\n');
          } else {
            child.stdin.write(password + '\n');
            if (options.cachePassword) {
              me.cachedPassword = password;
            }
          }
        }
      });
    });
    return child;
  }
}

