import { CommandImpl, ProgressBar } from 'firmament-yargs';
export declare class MakeCommand extends CommandImpl {
    static defaultConfigFilename: string;
    static jsonFileExtension: string;
    static progressBar: ProgressBar;
    private firmamentDocker;
    constructor();
    private buildCommandTree();
    private pushTemplateCommand();
    private pushBuildCommand();
    private buildTemplate(argv);
    private makeTemplate(argv);
    private static getJsonConfigFilePath(filename);
    private processContainerConfigs(containerConfigs);
    private static writeJsonTemplateFile(fullOutputPath, writeFullTemplate);
    private remoteSlcCtlCommand(msg, expressApp, cmd, cb);
    private containerDependencySort(containerConfigs);
    private topologicalDependencySort(graph);
    private gitClone(gitUrl, gitBranch, localFolder, cb);
}
