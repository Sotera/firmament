import {CommandImpl, ProgressBar, ProgressBarImpl} from 'firmament-yargs';
import {
  FirmamentDocker, FirmamentDockerImpl, ContainerRemoveResults, DockerContainer, ExpressApp,
  DockerDescriptors, ContainerConfig, SpawnOptions
} from "firmament-docker";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
const async = require('async');
const request = require('request');
const fs = require('fs');
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
      get: {
        type: 'string',
        desc: 'Get a container cluster template from GitHub (use -ls to list available templates)'
      },
      ls: {
        type: 'string',
        desc: 'List available Docker container cluster templates'
      },
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
    let objectToWrite:any = argv.full
      ? DockerDescriptors.dockerContainerDefaultTemplate
      : DockerDescriptors.dockerContainerConfigTemplate;
    if(argv.ls){
      //request.get()
    }
    switch (argv.library) {
      case 'genie-ui':
        objectToWrite =
          [
            {
              "name": "genie-strongloop",
              "Image": "jreeme/genie-ui:09-JUN-2016",
              "DockerFilePath": "",
              "Hostname": "genie-strongloop",
              "ExposedPorts": {
                "8080/tcp": {},
                "8888/tcp": {}
              },
              "HostConfig": {
                "PortBindings": {
                  "8888/tcp": [
                    {
                      "HostPort": "8888"
                    }
                  ],
                  "8080/tcp": [
                    {
                      "HostPort": "8080"
                    }
                  ],
                  "8701/tcp": [
                    {
                      "HostPort": "8701"
                    }
                  ]
                }
              },
              "ExpressApps": [
                {
                  "GitUrl": "https://github.com/Sotera/genie-ui.git",
                  "DeployExisting": true,
                  "GitSrcBranchName": "master",
                  "StrongLoopBranchName": "deploy",
                  "StrongLoopServerUrl": "http://localhost:8701",
                  "ServiceName": "GenieUI",
                  "DoBowerInstall": true,
                  "EnvironmentVariables": {
                    "RUN_AS_NODERED": 0,
                    "PORT": 8080,
                    "USE_NODERED_CLUSTERING": 0,
                    "NODE_ENV": "production",
                    "GEOCODER_API_KEY": "<ONDEPLOY>",
                    "GEOCODER_ENDPOINT": "<ONDEPLOY>"
                  },
                  "Scripts": [
                    {
                      "RelativeWorkingDir": ".",
                      "Command": "cp",
                      "Args": [
                        "server/config.json.template",
                        "server/config.json"
                      ]
                    }
                  ]
                },
                {
                  "GitUrl": "https://github.com/Sotera/genie-ui.git",
                  "DeployExisting": true,
                  "GitSrcBranchName": "master",
                  "StrongLoopBranchName": "deploy",
                  "StrongLoopServerUrl": "http://localhost:8701",
                  "ServiceName": "NodeRed",
                  "ClusterSize": 1,
                  "EnvironmentVariables": {
                    "PORT": 8888,
                    "RUN_AS_NODERED": 1,
                    "USE_NODERED_CLUSTERING": 0,
                    "GENIE_HOST": "http://genie-strongloop:8080",
                    "NODE_ENV": "production"
                  },
                  "Scripts": [
                    {
                      "RelativeWorkingDir": ".",
                      "Command": "cp",
                      "Args": [
                        "server/config.json.template",
                        "server/config.json"
                      ]
                    }
                  ]
                }
              ]
            }
          ];
        break;
      default:
        console.log("Can't find library: '" + argv.library + "'");
        this.processExit();
        break;
    }
    var fs = require('fs');
    if (fs.existsSync(fullOutputPath)
      && !positive("Config file '" + fullOutputPath + "' already exists. Overwrite? [Y/n] ", true)) {
      console.log('Canceling JSON template creation!');
      this.processExit();
    }
    MakeCommand.writeJsonTemplateFile(objectToWrite, fullOutputPath);
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
                  (cb:(err:Error, result?:any)=>void)=> {//Figure out git clone folder name and check 'DeployExisting'
                    let cwd = process.cwd();
                    let serviceName = expressApp.ServiceName;
                    if (expressApp.DeployExisting) {
                      let serviceSourceFolders = fs.readdirSync(cwd).filter((fileName)=> {
                        return fileName.substring(0, serviceName.length) === serviceName;
                      });
                      if (serviceSourceFolders.length > 1) {
                        let msg = 'DeployExisting was specified but there is more than one service named: ';
                        msg += serviceName + ': ' + serviceSourceFolders + '. Delete all but one and retry.';
                        cb(new Error(msg));
                        return;
                      } else if (serviceSourceFolders.length > 0) {
                        expressApp.GitCloneFolder = cwd + '/' + serviceSourceFolders[0];
                        cb(null);
                        return;
                      }
                    }
                    expressApp.GitCloneFolder = cwd + '/' + expressApp.ServiceName + (new Date()).getTime();
                    cb(null);
                  },
                  (cb:(err:Error, result?:any)=>void)=> {//Clone Express app Git Repo
                    //noinspection JSUnusedLocalSymbols
                    //Check for existence of GitCloneFolder ...
                    fs.stat(expressApp.GitCloneFolder, (err, stats)=> {
                      if (err) {
                        //Directory does not exist, clone it
                        self.gitClone(expressApp.GitUrl,
                          expressApp.GitSrcBranchName,
                          expressApp.GitCloneFolder, (err:Error)=> {
                            cb(err);
                          });
                      } else {
                        cb(null);
                      }
                    });
                  },
                  (cb:(err:Error, result:any)=>void)=> {//Make sure there's a Strongloop PM listening
                    let retries:number = 3;
                    (function checkForStrongloop() {
                      self.remoteSlcCtlCommand('Looking for SLC PM ...', expressApp, ['info'],
                        (err:Error, result:string)=> {
                          --retries;
                          const errorMsg = 'Strongloop not available';
                          const readyResult = /Driver Status:\s+running/;
                          if (err) {
                            cb(new Error(err.message), errorMsg);
                            setTimeout(checkForStrongloop, 3000);
                          } else if (readyResult.test(result)) {
                            cb(null, 'Strongloop ready.');
                          } else if (retries < 0) {
                            cb(new Error(errorMsg), errorMsg);
                          }else{
                            setTimeout(checkForStrongloop, 3000);
                          }
                        });
                    })();
                  },
                  (cb:(err:Error, result:any)=>void)=> {//Create Strongloop app
                    let serviceName = expressApp.ServiceName;
                    let msg = 'Creating ' + serviceName;
                    self.remoteSlcCtlCommand(msg, expressApp, ['create', serviceName], cb);
                  },
                  (cb:(err:Error, result?:any)=>void)=> {//Set ClusterSize
                    if (!expressApp.ClusterSize) {
                      cb(null);
                      return;
                    }
                    let clusterSize = expressApp.ClusterSize.toString();
                    self.remoteSlcCtlCommand('Setting cluster size to: ' + clusterSize,
                      expressApp, ['set-size', expressApp.ServiceName, clusterSize], cb);
                  },
                  (cb:(err:Error, result?:any)=>void)=> {//Set ExpressApp environment
                    expressApp.EnvironmentVariables = expressApp.EnvironmentVariables || {};
                    let cmd = ['env-set', expressApp.ServiceName];
                    for (let environmentVariable in expressApp.EnvironmentVariables) {
                      cmd.push(environmentVariable
                        + '='
                        + expressApp.EnvironmentVariables[environmentVariable]);
                    }
                    self.remoteSlcCtlCommand('Setting environment variables', expressApp, cmd, cb);
                  },
                  (cb:(err:Error, result?:any)=>void)=> {//Perform Bower install if required
                    if (!expressApp.DoBowerInstall) {
                      cb(null);
                      return;
                    }
                    let cwd = expressApp.GitCloneFolder;
                    self.spawnShellCommand(['bower', 'install', '--config.interactive=false'], {
                      cwd,
                      stdio: null
                    }, cb);
                  },
                  (cb:(err:Error, result:any)=>void)=> {
                    //Perform NPM install --ignore-scripts in case any scripts require node_modules
                    let cwd = expressApp.GitCloneFolder;
                    self.spawnShellCommand(['npm', 'install', '--ignore-scripts'], {cwd, stdio: null}, cb);
                  },
                  (cb:(err:Error, result:any)=>void)=> {//Execute local scripts
                    //noinspection JSUnusedLocalSymbols
                    async.mapSeries(expressApp.Scripts || [],
                      (script, cb:(err:Error, result:any)=>void)=> {
                        let cwd = expressApp.GitCloneFolder + '/' + script.RelativeWorkingDir;
                        let cmd = [script.Command];
                        cmd = cmd.concat(script.Args);
                        self.spawnShellCommand(cmd, {cwd, stdio: null}, cb);
                      },
                      (err:Error, results:any)=> {
                        cb(err, null);
                      });
                  },
                  (cb:(err:Error, result:any)=>void)=> {//Perform Strongloop build ...
                    let cwd = expressApp.GitCloneFolder;
                    self.spawnShellCommand(['slc', 'build', '--scripts'], {cwd, stdio: null}, cb);
                  },
                  (cb:(err:Error, result:any)=>void)=> {//... and Strongloop deploy
                    let cwd = expressApp.GitCloneFolder;
                    console.log('StrongLoop Deploying @ ' + cwd);
                    self.spawnShellCommand(['slc', 'deploy', '--service=' + expressApp.ServiceName,
                      expressApp.StrongLoopServerUrl], {
                      cwd,
                      stdio: null
                    }, cb);
                  }
                ], cb);
              }, cb);
          }, cb);
      }
    ], (err:Error, results:string)=> {
      self.processExitWithError(err);
    });
  }

  private static writeJsonTemplateFile(objectToWrite:any, fullOutputPath:string) {
    console.log("Writing JSON template file '" + fullOutputPath + "' ...");
    var jsonFile = require('jsonfile');
    jsonFile.spaces = 2;
    jsonFile.writeFileSync(fullOutputPath, objectToWrite);
  }

  private remoteSlcCtlCommand(msg:string, expressApp:ExpressApp, cmd:string[], cb:(err:Error, result:string)=>void) {
    let cwd = expressApp.GitCloneFolder;
    let serviceName = expressApp.ServiceName;
    let serverUrl = expressApp.StrongLoopServerUrl;
    console.log(msg + ' "' + serviceName + '" @ "' + cwd + '" via "' + serverUrl + '"');
    var baseCmd = ['slc', 'ctl', '-C', serverUrl];
    Array.prototype.push.apply(baseCmd, cmd);
    this.spawnShellCommandAsync(baseCmd, {cwd, stdio: 'pipe'}, (err, result)=> {
      console.log(result);
      cb(err, result);
    });
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
    this.spawnShellCommand(['git', 'clone', '-b', gitBranch, '--single-branch', gitUrl, localFolder],
      {cwd: process.cwd(), stdio: 'pipe'}, cb);
  }
}

