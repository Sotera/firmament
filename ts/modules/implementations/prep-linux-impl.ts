import {PrepLinux} from '../interfaces/prep-linux';
import {CommandImpl} from 'firmament-yargs';
import {Sudo} from '../interfaces/sudo';
import {SudoImpl} from '../implementations/sudo-impl';
const async = require('async');
export class PrepLinuxImpl extends CommandImpl implements PrepLinux {
  ubuntu_14_04(argv:any, cb:(err:Error, result:any)=>void) {
    //TODO: Just hack it in for now, later give user choices of what to do
    var me = this;
    async.series([
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand('sh', ['-c', 'echo "set -o vi" >> ~/.bashrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand('sh', ['-c', 'echo "alias f=\'firmament\'" >> ~/.bashrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand('sh', ['-c', 'echo "alias d=\'docker\'" >> ~/.bashrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand('sh', ['-c', 'echo "set nu" >> ~/.vimrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        var sudo:Sudo = new SudoImpl();
        var sudoOptions = {
          cachePassword: true
          //,prompt: '[sudo] password: '
          //,spawnOptions: {stdio: 'inherit'}
        };
        var child = sudo.spawnSync(['ls', '-Fal', '/tmp'], sudoOptions);
        child.stdout.on('data', (data)=> {
          console.log(data.toString());
        });
        /*        console.log('Firing it up!');
         var sudoOptions = {
         cachePassword: true,
         prompt: '[sudo] password: '
         //,spawnOptions: {stdio: 'inherit'}
         };
         var child = sudo(['ls', '-F'], sudoOptions);
         //var child = sudo(['apt-get', 'update'], sudoOptions);
         child.stdout.on('data', (data)=>{
         console.log(data.toString());
         });*/
      }
    ], cb);
  }

  constructor() {
    super();
  }
}
