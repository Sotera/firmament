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
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "set -o vi" >> ~/.bashrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "alias f=\'firmament\'" >> ~/.bashrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "alias d=\'docker\'" >> ~/.bashrc'], null, cb);
      },
      function (cb:(err:Error)=>void) {
        me.spawnShellCommand(['/bin/sh', '-c', 'echo "set nu" >> ~/.vimrc'], null, cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-get', 'update'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-get', 'install', '-y', 'apt-transport-https', 'ca-certificates'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-key', 'adv', '--keyserver', 'hkp://p80.pool.sks-keyservers.net:80', '--recv-keys',
          '58118E89F3A912897C070ADBF76221572C52609D'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['/bin/sh', '-c',
            'echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" > /etc/apt/sources.list.d/docker.list'],
          cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-get', 'update'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-cache', 'policy', 'docker-engine'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-get', 'update'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.spawnShellCommandAsync(['uname', '-r'], (err,result)=>{
          var uname = result.replace('\n','');
          me.sudoSpawn(['apt-get', 'install', '-y', 'linux-image-extra-' + uname], cb);
        });
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-get', 'install', '-y', 'apparmor'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['apt-get', 'install', '-y', 'docker-engine'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.sudoSpawn(['service', 'docker', 'start'], cb);
      }
      , function (cb:(err?:Error)=>void) {
        me.spawnShellCommandAsync(['whoami'], (err,result)=>{
          var whoami = result.replace('\n','');
          me.sudoSpawn(['usermod', '-aG', 'docker', whoami], cb);
        });
      }
    ], cb);
  }
}
