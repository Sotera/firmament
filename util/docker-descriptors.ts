export class DockerDescriptors {
  static dockerContainerConfigTemplate = [
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
  static dockerContainerDefaultDescriptor =
  {
    "Hostname": "",
    "Domainname": "",
    "User": "",
    "AttachStdin": false,
    "AttachStdout": true,
    "AttachStderr": true,
    "Tty": false,
    "OpenStdin": false,
    "StdinOnce": false,
    "Env": [
      "FOO=bar"
    ],
    "Cmd": [
    ],
    "Entrypoint": "",
    "Image": "ubuntu",
    "Labels": {
      "com.example.vendor": "Acme",
      "com.example.license": "GPL",
      "com.example.version": "1.0"
    },
    "Mounts": [
      {
        "Name": "fac362...80535",
        "Source": "/data",
        "Destination": "/data",
        "Driver": "local",
        "Mode": "ro,Z",
        "RW": false,
        "Propagation": ""
      }
    ],
    "WorkingDir": "",
    "NetworkDisabled": false,
    "MacAddress": "12:34:56:78:9a:bc",
    "ExposedPorts": {
      "22/tcp": {}
    },
    "StopSignal": "SIGTERM",
    "HostConfig": {
      "Binds": ["/tmp:/tmp"],
      "Links": ["redis3:redis"],
      "Memory": 0,
      "MemorySwap": 0,
      "MemoryReservation": 0,
      "KernelMemory": 0,
      "CpuShares": 512,
      "CpuPeriod": 100000,
      "CpuQuota": 50000,
      "CpusetCpus": "0,1",
      "CpusetMems": "0,1",
      "BlkioWeight": 300,
      "BlkioWeightDevice": [{}],
      "BlkioDeviceReadBps": [{}],
      "BlkioDeviceReadIOps": [{}],
      "BlkioDeviceWriteBps": [{}],
      "BlkioDeviceWriteIOps": [{}],
      "MemorySwappiness": 60,
      "OomKillDisable": false,
      "OomScoreAdj": 500,
      "PortBindings": {"22/tcp": [{"HostPort": "11022"}]},
      "PublishAllPorts": false,
      "Privileged": false,
      "ReadonlyRootfs": false,
      "Dns": ["8.8.8.8"],
      "DnsOptions": [""],
      "DnsSearch": [""],
      "ExtraHosts": null,
      "VolumesFrom": ["parent", "other:ro"],
      "CapAdd": ["NET_ADMIN"],
      "CapDrop": ["MKNOD"],
      "GroupAdd": ["newgroup"],
      "RestartPolicy": {"Name": "", "MaximumRetryCount": 0},
      "NetworkMode": "bridge",
      "Devices": [],
      "Ulimits": [{}],
      "LogConfig": {"Type": "json-file", "Config": {}},
      "SecurityOpt": [""],
      "CgroupParent": "",
      "VolumeDriver": "",
      "ShmSize": 67108864
    }
  };
  /*  {

   Image: '',
   Hostname: '',
   DomainName: '',
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
   }*/
  static dockerContainerDefaultTemplate = [
    DockerDescriptors.dockerContainerDefaultDescriptor
  ];
}
