import {PrepLinux} from '../interfaces/prep-linux';
import {CommandImpl} from 'firmament-yargs';
const async = require('async');
export class PrepLinuxImpl extends CommandImpl implements PrepLinux {
  constructor() {
    super();
  }

  ubuntu_14_04(argv:any, cb:(err:Error, result:any)=>void) {
    //TODO: Just hack it in for now, later give user choices of what to do
    var me = this;
    async.series([
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "set -o vi" >> ~/.bashrc'], cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "alias f=\'firmament\'" >> ~/.bashrc'], cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "alias d=\'docker\'" >> ~/.bashrc'], cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "set nu" >> ~/.vimrc'], cb);
      },
      function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['ps', '-Fel'], cb);
      }
    ], cb);
  }
}
