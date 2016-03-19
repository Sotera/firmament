export class DockerDescriptors{
  static dockerContainerConfigTemplate =[
    {
      name: 'data-container',
      Image: 'jreeme/data-container:1.1',
      DockerFilePath: 'docker/data-container',
      Hostname: 'data-container'
    },
    {
      name: 'mysql',
      Image: 'jreeme/mysql:5.5.3',
      DockerFilePath: 'docker/mysql/5.5',
      Env: ['MYSQL_ROOT_PASSWORD=root'],
      Hostname: 'mysql',
      HostConfig: {
        //Links: ['data-container:data-container'],
        VolumesFrom: ['data-container']
      }
    },
    {
      name: 'mongo',
      Image: 'jreeme/mongo:2.6',
      DockerFilePath: 'docker/mongo/2.6',
      Hostname: 'mongo',
      HostConfig: {
        //Links: ['data-container:data-container'],
        VolumesFrom: ['data-container']
      }
    },
    {
      name: 'loopback',
      Image: 'jreeme/strongloop:10',
      DockerFilePath: 'docker/strong-pm',
      Hostname: 'loopback',
      ExposedPorts: {
        '3001/tcp': {}
      },
      HostConfig: {
        Links: ['mongo:mongo', 'mysql:mysql'],
        PortBindings: {
          '3001/tcp': [{HostPort: '3001'}],
          '8701/tcp': [{HostPort: '8701'}]
        }
      },
      ExpressApps: [
        {
          GitUrl: 'https://github.com/Sotera/DatawakeManager-Loopback',
          GitSrcBranchName: 'master',
          StrongLoopBranchName: 'deploy',
          StrongLoopServerUrl: 'http://localhost:8701',
          ServiceName: 'DatawakeManager-Loopback'
        }
      ]
    },
    {
      name: 'webapp',
      Image: 'jreeme/strongloop:10',
      DockerFilePath: 'docker/strong-pm',
      Hostname: 'webapp',
      ExposedPorts: {
        '3001/tcp': {}
      },
      HostConfig: {
        Links: ['loopback:loopback'],
        VolumesFrom: ['data-container'],
        PortBindings: {
          '3001/tcp': [{HostPort: '3002'}],
          '8701/tcp': [{HostPort: '8702'}]
        }
      },
      ExpressApps: [
        {
          GitUrl: 'https://github.com/Sotera/DatawakeManager-WebApp',
          GitSrcBranchName: 'master',
          StrongLoopBranchName: 'deploy',
          StrongLoopServerUrl: 'http://localhost:8702',
          ServiceName: 'DatawakeManager-WebApp',
          Scripts: [
            {
              RelativeWorkingDir: '.',
              Command: 'bower',
              Args: ['install', '--config.interactive=false']
            }
          ]
        }
      ]
    },
    {
      name: 'tangelo',
      Image: 'jreeme/tangelo:1.1',
      DockerFilePath: 'docker/tangelo',
      Hostname: 'tangelo',
      ExposedPorts: {
        '80/tcp': {}
      },
      HostConfig: {
        Links: ['mysql:mysql', 'loopback:loopback'],
        PortBindings: {
          '80/tcp': [{HostPort: '80'}]
        }
      }
    }
  ];

  static dockerContainerDefaultDescriptor ={
    Image: '',
    Hostname: '',
    Domainname: '',
    User: '',
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: false,
    StdinOnce: false,
    Env: ['ENV0=how now brown cow', 'ENV1=320'],
    Cmd: [],
    Entrypoint: '',
    Labels: {
      'version': '1.0'
    },
    Volumes: {
      '/tmp': {}
    },
    WorkingDir: '',
    NetworkDisabled: false,
    MacAddress: '',
    ExposedPorts: {
      //'22/tcp': {}
    },
    SecurityOpts: [''],
    HostConfig: {
      Binds: null,
      BindsExample: ['/tmp:/tmp'],
      Links: null,
      LinksExample: ['redis:redis'],
      LxcConf: {'lxc.utsname': 'docker'},
      Memory: 0,
      MemorySwap: 0,
      CpuShares: 512,
      CpusetCpus: null,
      PortBindings: null,
      PortBindingsExample: {'22/tcp': [{'HostPort': '11022'}]},
      PublishAllPorts: false,
      Privileged: false,
      ReadonlyRootfs: false,
      Dns: null,
      DnsExample: ['8.8.8.8', '9.9.9.9'],
      DnsSearch: null,
      ExtraHosts: null,
      ExtraHostsExample: ['localhost:127.0.0.1'],
      VolumesFrom: null,
      VolumesFromExample: ['containerName[:<ro|rw>]'],
      CapAdd: ['NET_ADMIN'],
      CapDrop: ['MKNOD'],
      RestartPolicy: {'Name': '', 'MaximumRetryCount': 0},
      RestartPolicyExample: {'Name': '<always|on-failure>', 'MaximumRetryCount': 0},
      NetworkMode: 'bridge',
      Devices: null,
      Ulimits: null,
      LogConfig: {'Type': 'json-file', Config: {}},
      CgroupParent: ''
    }
  }
  
  static dockerContainerDefaultTemplate =[
    DockerDescriptors.dockerContainerDefaultDescriptor
  ];
}
