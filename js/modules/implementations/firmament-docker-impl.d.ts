import { FirmamentDocker } from '../interfaces/firmament-docker';
import { CommandImpl } from 'firmament-yargs';
import { DockerImage, Container, ContainerRemoveResults } from '../interfaces/dockerode';
export declare class FirmamentDockerImpl extends CommandImpl implements FirmamentDocker {
    private dockerode;
    constructor();
    createContainer(containerConfig: any, cb: (err: Error, container: Container) => void): void;
    removeContainers(ids: string[], cb: (err: Error, containerRemoveResults: ContainerRemoveResults[]) => void): void;
    startOrStopContainers(ids: string[], start: boolean, cb: () => void): void;
    getContainers(ids: string[], cb: (err: Error, containers: Container[]) => void): void;
    getContainer(id: string, cb: (err: Error, container: Container) => void): void;
    exec(id: string, command: string, cb: (err: Error, result: any) => void): void;
    listContainers(listAllContainers: boolean, cb: (err: Error, containers?: Container[]) => void): void;
    listImages(listAllImages: boolean, cb: (err: Error, images: DockerImage[]) => void): void;
    buildDockerFile(dockerFilePath: string, dockerImageName: string, progressCb: (taskId: string, status: string, current: number, total: number) => void, cb: (err: Error) => void): void;
    pullImage(imageName: string, progressCb: (taskId: string, status: string, current: number, total: number) => void, cb: (err: Error) => void): void;
}
