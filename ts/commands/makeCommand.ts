import {CommandImpl, ProgressBar, ProgressBarImpl} from 'firmament-yargs';
import {
  FirmamentDocker, FirmamentDockerImpl, ContainerRemoveResults, DockerContainer, ExpressApp,
  DockerDescriptors, ContainerConfig
} from "firmament-docker";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
const async = require('async');
const positive = require('positive');
import * as _ from 'lodash';
interface ErrorEx extends Error {
  statusCode:number,
  json:string
}
export class MakeCommand extends CommandImpl {
  static defaultConfigFilename = 'firmament.json';
  static jsonFileExtension = '.json';
  static progressBar:ProgressBar = new ProgressBarImpl();
  private firmamentDocker:FirmamentDocker = new FirmamentDockerImpl();

  constructor() {
    super();
    this.buildCommandTree();
  }

  private buildCommandTree() {
    this.aliases = ['make', 'm'];
    this.command = '<subCommand>';
    this.commandDesc = 'Support for building Docker container clusters';
    this.pushBuildCommand();
    this.pushTemplateCommand();
  };

  private pushTemplateCommand() {
    let templateCommand = new CommandImpl();
    templateCommand.aliases = ['template', 't'];
    templateCommand.commandDesc = 'Create a template JSON spec for a container cluster';
    //noinspection ReservedWordAsName
    templateCommand.options = {
      output: {
        alias: 'o',
        default: MakeCommand.defaultConfigFilename,
        type: 'string',
        desc: 'Name the output JSON file'
      },
      full: {
        alias: 'f',
        boolean: true,
        default: false,
        desc: 'Create a full JSON template with all Docker options set to reasonable defaults'
      }
    };
    templateCommand.handler = (argv:any)=> this.makeTemplate(argv);
    this.subCommands.push(templateCommand);
  };

  private pushBuildCommand() {
    let buildCommand = new CommandImpl();
    buildCommand.aliases = ['build', 'b'];
    buildCommand.commandDesc = 'Build Docker containers based on JSON spec';
    //noinspection ReservedWordAsName
    buildCommand.options = {
      verbose: {
        alias: 'v',
        default: false,
        type: 'boolean',
        desc: 'Name the config JSON file'
      },
      input: {
        alias: 'i',
        default: MakeCommand.defaultConfigFilename,
        type: 'string',
        desc: 'Name the config JSON file'
      }
    };
    buildCommand.handler = (argv:any)=> this.buildTemplate(argv);
    this.subCommands.push(buildCommand);
  };

  private buildTemplate(argv:any) {
    let fullInputPath = MakeCommand.getJsonConfigFilePath(argv.input);
    console.log("Constructing Docker containers described in: '" + fullInputPath + "'");
    var jsonFile = require('jsonfile');
    var containerDescriptors = jsonFile.readFileSync(fullInputPath);
    this.processContainerConfigs(containerDescriptors);
  }

  private makeTemplate(argv:any) {
    let fullOutputPath = MakeCommand.getJsonConfigFilePath(argv.output);
    var fs = require('fs');
    if (fs.existsSync(fullOutputPath)) {
      if (positive("Config file '" + fullOutputPath + "' already exists. Overwrite? [Y/n] ", true)) {
        MakeCommand.writeJsonTemplateFile(fullOutputPath, argv.full);
      } else {
        console.log('Canceling JSON template creation!');
      }
    } else {
      MakeCommand.writeJsonTemplateFile(fullOutputPath, argv.full);
    }
    this.processExit();
  }

  private static getJsonConfigFilePath(filename) {
    let path = require('path');
    let cwd = process.cwd();
    let regex = new RegExp('(.*)\\' + MakeCommand.jsonFileExtension + '$', 'i');
    if (regex.test(filename)) {
      filename = filename.replace(regex, '$1' + MakeCommand.jsonFileExtension);
    } else {
      filename = filename + MakeCommand.jsonFileExtension;
    }
    return path.resolve(cwd, filename);
  }

  private processContainerConfigs(containerConfigs:ContainerConfig[]) {
    let self = this;
    let containerConfigsByImageName = {};
    containerConfigs.forEach(containerConfig=> {
      containerConfigsByImageName[containerConfig.Image] = containerConfig;
    });
    //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    async.waterfall([
      //Remove all containers mentioned in config file
      (cb:(err:Error, containerRemoveResults:ContainerRemoveResults[])=>void)=> {
        this.firmamentDocker.removeContainers(containerConfigs.map(containerConfig=>containerConfig.name), cb);
      },
      (containerRemoveResults:ContainerRemoveResults[], cb:(err:Error, missingImageNames:string[])=>void)=> {
        this.firmamentDocker.listImages(false, (err, images)=> {
          if (self.callbackIfError(cb, err)) {
            return;
          }
          let repoTags = {};
          images.forEach(dockerImage=> {
            repoTags[dockerImage.RepoTags[0]] = true;
          });
          let missingImageNames:string[] = [];
          containerConfigs.forEach(containerConfig=> {
            let imageName = (containerConfig.Image.indexOf(':') == -1)
              ? containerConfig.Image + ':latest'
              : containerConfig.Image;
            if (!repoTags[imageName]) {
              missingImageNames.push(imageName);
            }
          });
          cb(null, _.uniq(missingImageNames));
        });
      },
      (missingImageNames:string[], cb:(err:Error, missingImageNames:string[])=>void)=> {
        async.mapSeries(missingImageNames,
          (missingImageName, cb:(err:Error, missingImageName:string)=>void)=> {
            //Try to pull image
            this.firmamentDocker.pullImage(missingImageName,
              function (taskId, status, current, total) {
                MakeCommand.progressBar.showProgressForTask(taskId, status, current, total);
              },
              (err:Error)=> {
                cb(null, err ? missingImageName : null);
              });
          },
          (err:Error, missingImageNames:string[])=> {
            if (self.callbackIfError(cb, err)) {
              return;
            }
            cb(null, missingImageNames.filter(missingImageName=>!!missingImageName));
          });
      },
      (missingImageNames:string[], cb:(err:Error, containerBuildErrors:Error[])=>void)=> {
        async.mapSeries(missingImageNames,
          (missingImageName, cb:(err:Error, containerBuildError:Error)=>void)=> {
            var containerConfig = containerConfigsByImageName[missingImageName];
            //Try to build from Dockerfile
            let path = require('path');
            let cwd = process.cwd();
            let dockerFilePath = path.join(cwd, containerConfig.DockerFilePath);
            let dockerImageName = containerConfig.Image;
            this.firmamentDocker.buildDockerFile(dockerFilePath, dockerImageName,
              function (taskId, status, current, total) {
                MakeCommand.progressBar.showProgressForTask(taskId, status, current, total);
              },
              (err:Error)=> {
                cb(null, err
                  ? new Error('Unable to build Dockerfile at "' + dockerFilePath + '" because: ' + err.message)
                  : null);
              });
          },
          (err:Error, errors:Error[])=> {
            if (self.callbackIfError(cb, err)) {
              return;
            }
            errors = errors.filter(error=>!!error);
            cb(self.logErrors(errors).length ? new Error() : null, errors);
          });
      },
      (errs:Error[], cb:(err:Error, results:any)=>void)=> {
        try {
          let sortedContainerConfigs = self.containerDependencySort(containerConfigs);
          //noinspection JSUnusedLocalSymbols
          async.mapSeries(sortedContainerConfigs,
            (containerConfig, cb:(err:Error, result:any)=>void)=> {
              this.firmamentDocker.createContainer(containerConfig, (err:ErrorEx, container:DockerContainer)=> {
                self.logAndCallback('Container "' + containerConfig.name + '" created.', cb, err, container);
              });
            },
            (err:Error, containers:DockerContainer[])=> {
              if (self.callbackIfError(cb, err)) {
                return;
              }
              let sortedContainerNames = sortedContainerConfigs.map(containerConfig=>containerConfig.name);
              this.firmamentDocker.startOrStopContainers(sortedContainerNames, true, ()=> {
                cb(null, null);
              });
            }
          );
        } catch (err) {
          self.callbackIfError(cb, err);
        }
      },
      function deployExpressApps(errs:Error[], cb:(err:Error, results:any)=>void) {
        //noinspection JSUnusedLocalSymbols
        async.mapSeries(containerConfigs,
          (containerConfig:ContainerConfig, cb:(err:Error, result:any)=>void)=> {
            //noinspection JSUnusedLocalSymbols
            async.mapSeries(containerConfig.ExpressApps || [],
              (expressApp:ExpressApp, cb:(err:Error, result:any)=>void)=> {
                //noinspection JSUnusedLocalSymbols
                async.series([
                    (cb:(err:Error, result:any)=>void)=> {
                      let cwd = process.cwd();
                      expressApp.GitCloneFolder = cwd + '/' + expressApp.ServiceName + (new Date()).getTime();
                      self.gitClone(expressApp.GitUrl,
                        expressApp.GitSrcBranchName,
                        expressApp.GitCloneFolder, (err:Error)=> {
                          self.logError(err);
                          cb(null, null);
                        });
                    },
                    (cb:(err:Error, result:any)=>void)=> {
                      //noinspection JSUnusedLocalSymbols
                      async.mapSeries(expressApp.Scripts || [],
                        (script, cb:(err:Error, result:any)=>void)=> {
                          let cwd = expressApp.GitCloneFolder + '/' + script.RelativeWorkingDir;
                          let cmd = [];
                          cmd.push(script.Command);
                          cmd = cmd.concat(script.Args);
                          self.spawnShellCommand(cmd, {cwd, stdio: null}, cb);
                        },
                        (err:Error, results:any)=> {
                          cb(null, null);
                        });
                    },
                    (cb:(err:Error, result:any)=>void)=> {
                      let cwd = expressApp.GitCloneFolder;
                      console.log('StrongLoop Building @ ' + cwd);
                      self.spawnShellCommand(['slc', 'build'], {cwd, stdio: null}, cb);
                    },
                    (cb:(err:Error, result:any)=>void)=> {
                      let cwd = expressApp.GitCloneFolder;
                      console.log('StrongLoop Deploying @ ' + cwd);
                      self.spawnShellCommand(['slc', 'deploy', '--service=' + expressApp.ServiceName,
                        expressApp.StrongLoopServerUrl], {
                        cwd,
                        stdio: null
                      }, cb);
                    }
                  ],
                  (err:Error, results:any)=> {
                    cb(null, null);
                  });
              },
              (err:Error, results:any)=> {
                cb(null, null);
              });
          },
          (err:Error, results:any)=> {
            cb(null, null);
          });
      }
    ], (err:Error, results:string)=> {
      self.processExit();
    });
  }

  private static writeJsonTemplateFile(fullOutputPath:string, writeFullTemplate:boolean) {
    console.log("Writing JSON template file '" + fullOutputPath + "' ...");
    let objectToWrite = writeFullTemplate
      ? DockerDescriptors.dockerContainerDefaultTemplate
      : DockerDescriptors.dockerContainerConfigTemplate;
    var jsonFile = require('jsonfile');
    jsonFile.spaces = 2;
    jsonFile.writeFileSync(fullOutputPath, objectToWrite);
  }

  private containerDependencySort(containerConfigs) {
    var sortedContainerConfigs = [];
    //Sort on linked container dependencies
    var objectToSort = {};
    var containerConfigByNameMap = {};
    containerConfigs.forEach(function (containerConfig) {
      if (containerConfigByNameMap[containerConfig.name]) {
        log.fatal('Same name is used by more than one container.');
      }
      containerConfigByNameMap[containerConfig.name] = containerConfig;
      var dependencies = [];
      if (containerConfig.HostConfig && containerConfig.HostConfig.Links) {
        containerConfig.HostConfig.Links.forEach(function (link) {
          var linkName = link.split(':')[0];
          dependencies.push(linkName);
        });
      }
      objectToSort[containerConfig.name] = dependencies;
    });
    var sortedContainerNames = this.topologicalDependencySort(objectToSort);
    sortedContainerNames.forEach(function (sortedContainerName) {
      sortedContainerConfigs.push(containerConfigByNameMap[sortedContainerName]);
    });
    return sortedContainerConfigs;
  }

  private topologicalDependencySort(graph) {
    var sorted = [], // sorted list of IDs ( returned value )
      visited = {}; // hash: id of already visited node => true
    // 2. topological sort
    try {
      Object.keys(graph).forEach(function visit(name:string, ancestors:any) {
        // if already exists, do nothing
        if (visited[name]) {
          return
        }
        if (!Array.isArray(ancestors)) {
          ancestors = []
        }
        ancestors.push(name);
        visited[name] = true;
        var deps = graph[name];
        deps.forEach(function (dep) {
          if (ancestors.indexOf(dep) >= 0) {
            log.fatal('Circular dependency "' + dep + '" is required by "' + name + '": ' + ancestors.join(' -> '));
          }
          visit(dep, ancestors.slice(0)); // recursive call
        });
        sorted.push(name);
      });
    } catch (ex) {
      throw new Error('Linked container dependency sort failed. You are probably trying to link to an unknown container.');
    }
    return sorted;
  }

  private gitClone(gitUrl:string, gitBranch:string, localFolder:string, cb:(err:Error, child:any)=>void) {
    this.spawnShellCommand(['git', 'clone', '-b', gitBranch, '--single-branch', gitUrl, localFolder], null, cb);
  }
}

