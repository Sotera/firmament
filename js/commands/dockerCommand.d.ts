import { CommandImpl, ProgressBar } from 'firmament-yargs';
export declare class DockerCommand extends CommandImpl {
    private firmamentDocker;
    static docker: any;
    static progressBar: ProgressBar;
    constructor();
    private buildCommandTree();
    private pushCleanVolumesCommand();
    private pushRemoveImagesCommand();
    private pushRemoveContainersCommand();
    private pushShellCommand();
    private pushStartCommand();
    private pushStopCommand();
    private pushImagesCommand();
    private pushPsCommand();
    private printImagesList(argv, cb);
    private printContainerList(argv, cb);
    private bashInToContainer(ids, cb);
    private prettyPrintDockerImagesList(err, images, cb);
    private prettyPrintDockerContainerList(err, containers, all, cb);
}
