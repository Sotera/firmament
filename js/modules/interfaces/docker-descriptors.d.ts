export declare class DockerDescriptors {
    static dockerContainerConfigTemplate: ({
        name: string;
        Image: string;
        DockerFilePath: string;
        Hostname: string;
        HostConfig: {};
    } | {
        name: string;
        Image: string;
        DockerFilePath: string;
        Hostname: string;
        HostConfig: {
            Links: string[];
            PortBindings: {
                '3001/tcp': {
                    HostPort: string;
                }[];
                '8701/tcp': {
                    HostPort: string;
                }[];
            };
        };
        ExpressApps: {
            GitUrl: string;
            GitSrcBranchName: string;
            StrongLoopBranchName: string;
            StrongLoopServerUrl: string;
            ServiceName: string;
        }[];
    } | {
        name: string;
        Image: string;
        DockerFilePath: string;
        Hostname: string;
        HostConfig: {
            Links: string[];
            PortBindings: {
                '3001/tcp': {
                    HostPort: string;
                }[];
                '3002/tcp': {
                    HostPort: string;
                }[];
                '3003/tcp': {
                    HostPort: string;
                }[];
                '8701/tcp': {
                    HostPort: string;
                }[];
            };
        };
        ExpressApps: {
            GitUrl: string;
            GitSrcBranchName: string;
            StrongLoopBranchName: string;
            StrongLoopServerUrl: string;
            ServiceName: string;
            'Scripts': {
                "RelativeWorkingDir": string;
                "Command": string;
                "Args": string[];
            }[];
        }[];
    })[];
    static dockerContainerDefaultDescriptor: {
        "Hostname": string;
        "Domainname": string;
        "User": string;
        "AttachStdin": boolean;
        "AttachStdout": boolean;
        "AttachStderr": boolean;
        "Tty": boolean;
        "OpenStdin": boolean;
        "StdinOnce": boolean;
        "Env": string[];
        "Cmd": any[];
        "Entrypoint": string;
        "Image": string;
        "Labels": {
            "com.example.vendor": string;
            "com.example.license": string;
            "com.example.version": string;
        };
        "Mounts": {
            "Name": string;
            "Source": string;
            "Destination": string;
            "Driver": string;
            "Mode": string;
            "RW": boolean;
            "Propagation": string;
        }[];
        "WorkingDir": string;
        "NetworkDisabled": boolean;
        "MacAddress": string;
        "ExposedPorts": {
            "22/tcp": {};
        };
        "StopSignal": string;
        "HostConfig": {
            "Binds": string[];
            "Links": string[];
            "Memory": number;
            "MemorySwap": number;
            "MemoryReservation": number;
            "KernelMemory": number;
            "CpuShares": number;
            "CpuPeriod": number;
            "CpuQuota": number;
            "CpusetCpus": string;
            "CpusetMems": string;
            "BlkioWeight": number;
            "BlkioWeightDevice": {}[];
            "BlkioDeviceReadBps": {}[];
            "BlkioDeviceReadIOps": {}[];
            "BlkioDeviceWriteBps": {}[];
            "BlkioDeviceWriteIOps": {}[];
            "MemorySwappiness": number;
            "OomKillDisable": boolean;
            "OomScoreAdj": number;
            "PortBindings": {
                "22/tcp": {
                    "HostPort": string;
                }[];
            };
            "PublishAllPorts": boolean;
            "Privileged": boolean;
            "ReadonlyRootfs": boolean;
            "Dns": string[];
            "DnsOptions": string[];
            "DnsSearch": string[];
            "ExtraHosts": any;
            "VolumesFrom": string[];
            "CapAdd": string[];
            "CapDrop": string[];
            "GroupAdd": string[];
            "RestartPolicy": {
                "Name": string;
                "MaximumRetryCount": number;
            };
            "NetworkMode": string;
            "Devices": any[];
            "Ulimits": {}[];
            "LogConfig": {
                "Type": string;
                "Config": {};
            };
            "SecurityOpt": string[];
            "CgroupParent": string;
            "VolumeDriver": string;
            "ShmSize": number;
        };
    };
    static dockerContainerDefaultTemplate: {
        "Hostname": string;
        "Domainname": string;
        "User": string;
        "AttachStdin": boolean;
        "AttachStdout": boolean;
        "AttachStderr": boolean;
        "Tty": boolean;
        "OpenStdin": boolean;
        "StdinOnce": boolean;
        "Env": string[];
        "Cmd": any[];
        "Entrypoint": string;
        "Image": string;
        "Labels": {
            "com.example.vendor": string;
            "com.example.license": string;
            "com.example.version": string;
        };
        "Mounts": {
            "Name": string;
            "Source": string;
            "Destination": string;
            "Driver": string;
            "Mode": string;
            "RW": boolean;
            "Propagation": string;
        }[];
        "WorkingDir": string;
        "NetworkDisabled": boolean;
        "MacAddress": string;
        "ExposedPorts": {
            "22/tcp": {};
        };
        "StopSignal": string;
        "HostConfig": {
            "Binds": string[];
            "Links": string[];
            "Memory": number;
            "MemorySwap": number;
            "MemoryReservation": number;
            "KernelMemory": number;
            "CpuShares": number;
            "CpuPeriod": number;
            "CpuQuota": number;
            "CpusetCpus": string;
            "CpusetMems": string;
            "BlkioWeight": number;
            "BlkioWeightDevice": {}[];
            "BlkioDeviceReadBps": {}[];
            "BlkioDeviceReadIOps": {}[];
            "BlkioDeviceWriteBps": {}[];
            "BlkioDeviceWriteIOps": {}[];
            "MemorySwappiness": number;
            "OomKillDisable": boolean;
            "OomScoreAdj": number;
            "PortBindings": {
                "22/tcp": {
                    "HostPort": string;
                }[];
            };
            "PublishAllPorts": boolean;
            "Privileged": boolean;
            "ReadonlyRootfs": boolean;
            "Dns": string[];
            "DnsOptions": string[];
            "DnsSearch": string[];
            "ExtraHosts": any;
            "VolumesFrom": string[];
            "CapAdd": string[];
            "CapDrop": string[];
            "GroupAdd": string[];
            "RestartPolicy": {
                "Name": string;
                "MaximumRetryCount": number;
            };
            "NetworkMode": string;
            "Devices": any[];
            "Ulimits": {}[];
            "LogConfig": {
                "Type": string;
                "Config": {};
            };
            "SecurityOpt": string[];
            "CgroupParent": string;
            "VolumeDriver": string;
            "ShmSize": number;
        };
    }[];
}
