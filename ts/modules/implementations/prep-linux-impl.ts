import {PrepLinux} from '../interfaces/prep-linux';
import {CommandImpl} from 'firmament-yargs';
import {Sudo} from '../interfaces/sudo';
import {SudoImpl} from '../implementations/sudo-impl';
const async = require('async');
export class PrepLinuxImpl extends CommandImpl implements PrepLinux {
  private sudo:Sudo = new SudoImpl();

  constructor() {
    super();
  }

  ubuntu_14_04(argv:any, cb:(err:Error, result:any)=>void) {
    //TODO: Just hack it in for now, later give user choices of what to do
    var me = this;
    async.series([
      function (cb:(err:Error)=>void) {
        me.spawn(['-c', 'echo "set -o vi" >> ~/.bashrc'], cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawn(['-c', 'echo "alias f=\'firmament\'" >> ~/.bashrc'], cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawn(['-c', 'echo "alias d=\'docker\'" >> ~/.bashrc'], cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawn(['-c', 'echo "set nu" >> ~/.vimrc'], cb);
      },
      function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['ps', '-Fel'], cb);
      }
    ], cb);
  }

  spawn(cmd:string[], cb:(err?:Error)=>void) {
    this.spawnShellCommand('sh', cmd, null, cb);
  }

  sudoSpawn(cmd:string[], cb:(err?:Error)=>void) {
    this.sudo.spawn(cmd, cb);
  }
}
