import {Sudo} from '../interfaces/sudo';
const spawn = require('child_process').spawn;
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
export class SudoImpl implements Sudo {
  private static cachedPassword:string;
  private static sudoBin:string = inpathSync('sudo', process.env['PATH'].split(':'));

  constructor() {
  }

  spawn(cmd:string[], cb:(err?:Error)=>void) {
    SudoImpl._spawn(cmd,cb);
  }
  spawnSync(cmd:string[]) {
    return SudoImpl._spawnSync(cmd);
  }
  
  private static _spawn(cmd:string[], cb:(err?:Error)=>void) {
    var child = SudoImpl._spawnSync(cmd);
    child.stdout.on('data', (data)=> {
      console.log(data.toString());
    });
    child.stdout.on('end', ()=> {
      cb();
    });
    child.stdout.on('close', ()=> {
      cb();
    });
    child.stdout.on('error', ()=> {
      cb(new Error('Something went wrong with spawn'));
    });
  }

  private static _spawnSync(command:string[]) {
    var me = this;
    var prompt = '#node-sudo-passwd#';
    var prompts = 0;
    var args = ['-S', '-p', prompt];
    args.push.apply(args, command);
    // The binary is the first non-dashed parameter to sudo
    var bin = command.filter(function (i) {
      return i.indexOf('-') !== 0;
    })[0];
    me.cachedPassword = me.cachedPassword
      || readlineSync.question('sudo requires your password: ', {hideEchoBack: true});
    var child = spawn(me.sudoBin, args, {stdio: 'pipe'});
    // FIXME: Remove this handler when the child has successfully started
    child.stderr.on('data', (data)=> {
      var lines = data.toString().trim().split('\n');
      lines.forEach((line)=> {
        if (line === prompt) {
          if (++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            console.log('Bad password, please let\'s try it again.');
            process.exit(1);
          }
          child.stdin.write(me.cachedPassword + '\n');
        }
      });
    });
    // Wait for the sudo:d binary to start up
    pidof(bin, function waitForStartup(err:Error, pid:number) {
      if (err) {
        throw new Error('Couldn\'t start ' + bin + ' : ' + err.message);
      }
      if (pid || child.exitCode !== null) {
        child.emit('started');
      } else {
        setTimeout(pidof(bin, waitForStartup), 100);
      }
    });
    return child;
  }
}

