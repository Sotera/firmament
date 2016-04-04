///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
const async = require('async');
import {DockerDescriptors} from "../util/docker-descriptors";
import {DockerCommand} from "./dockerCommand";
interface ErrorEx extends Error {
  statusCode:number,
  json:string
}
export class MakeCommand extends CommandImpl {
  static defaultConfigFilename = 'firmament.json';
  static jsonFileExtension = '.json';

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
    templateCommand.command = '[options]';
    templateCommand.commandDesc = 'Create a template JSON spec for a container cluster';
    templateCommand.options = {
      output: {
        alias: 'o',
        default: MakeCommand.defaultConfigFilename,
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
    this.processContainerConfigs(containerDescriptors, argv.verbose);
  }

  private makeTemplate(argv:any) {
    if (argv._.length > 1) {
      throw new Error('Too many non-option arguments');
    }
    let fullOutputPath = MakeCommand.getJsonConfigFilePath(argv.output);
    var fs = require('fs');
    if (fs.existsSync(fullOutputPath)) {
      var positive = require('positive');
      if (positive("Config file '" + fullOutputPath + "' already exists. Overwrite? [Y/n]", true)) {
        MakeCommand.writeJsonTemplateFile(fullOutputPath, argv.full);
      } else {
        console.log('Canceling JSON template creation!');
      }
      return;
    }
    MakeCommand.writeJsonTemplateFile(fullOutputPath, argv.full);
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

  private processContainerConfigs(containerConfigs:any[], verbose:boolean) {
    var docker = new DockerCommand();
    async.waterfall([
      //Remove all containers mentioned in config file
      (cb:(err:Error, containerConfigs:any[])=>void)=> {
        docker.removeContainers(containerConfigs.map(containerConfig=> {
          return containerConfig.name;
        }), cb);
      },
      (containerRemoveResults:any[], cb:(err:Error, results:any)=>void)=> {
        let sortedContainerConfigs = this.containerDependencySort(containerConfigs);
        async.eachSeries(sortedContainerConfigs,
          (containerConfig, cb:(err:Error, results?:any)=>void)=> {
            async.waterfall([
              (cb:(err:Error, tryPullImage?:boolean)=>void)=> {
                //Most common scenario is that image exists but not container (since we just
                //blew them away). Try to create container. This call will not fail. If the
                //correct image isn't available to back it up the failure will occur when we
                //start the container.
                docker.createContainer(containerConfig, (err:ErrorEx, container:any)=> {
                  if (err) {
                    cb(null, err.statusCode === 404);
                  }
                  else if (container) {
                    //cb(null,false);return;
                    container.start((err:ErrorEx)=> {
                      if (err) {
                        if (err.statusCode === 500) {
                          //This is an odd case where we were allowed to create a container without
                          //a backing image. Rewrite err.message to let user know containerConfig.Image
                          //is incorrect.
                          err.message = 'Container "' + containerConfig.name;
                          err.message += '" is corrupt and being destroyed. Image name is probably bad.';
                        }
                        //Corrupt container, blast it
                        container.remove({force: 1}, ()=> {
                          cb(err);
                        });
                      } else {
                        //Everything's cool & container is started. Use non-null Error to short-circuit
                        //async waterfall
                        let benignErr = new Error();
                        benignErr.message = 'Container "' + containerConfig.name;
                        benignErr.message += '" has started.';
                        cb(benignErr);
                      }
                    });
                  }
                });
              },
              (tryPullImage = false, cb:(err:Error, tryBuildDockerfile:boolean)=>void)=> {
                if (tryPullImage) {
                  console.log('Pulling image "' + containerConfig.Image + '"');
                  docker.pullImage(containerConfig, (err:Error)=> {
                    cb(null, !!err);
                  });
                } else {
                  cb(null, false);
                }
              },
              (tryBuildDockerfile, cb:(err:Error, result?:any)=>void)=> {
                if (tryBuildDockerfile) {
                  let path = require('path');
                  let cwd = process.cwd();
                  let dockerFilePath = path.join(cwd, containerConfig.DockerFilePath);
                  let dockerImageName = containerConfig.Image;
                  docker.buildDockerFile(dockerFilePath, dockerImageName, (err:Error)=> {
                    if (err) {
                      cb(err);
                      return;
                    }
                    let msg = 'Built Docker image: "';
                    msg += dockerImageName + '" from: "';
                    msg += dockerFilePath + '"';
                    console.log(msg);
                    docker.createContainer(containerConfig, (err:ErrorEx)=> {
                      cb(err);
                    });
                  });
                } else {
                  cb(null);
                }
              },
              (cb:(err:Error)=>void)=> {
                //start container
                var c = containerConfig;
                cb(null);
              }
            ], (err:Error, results:string)=> {
              cb(err, results);
            });
          }, (err:Error, results:string) => {
            cb(err, results);
          });
      }
    ], (err:Error, results:string)=> {
      if (err) {
        log.error(err.message)
      }
      console.log(results);
      process.exit(0);
    });
    /*  sortedContainerConfigs.forEach(function (containerConfig) {
     if (!containerConfig.ExpressApps) {
     return;
     }
     containerConfig.ExpressApps.forEach(function (expressApp) {
     try {
     expressApp.GitCloneFolder = cwd + '/' + expressApp.ServiceName + (new Date()).getTime();
     wait.for(make_GitClone, expressApp.GitUrl, expressApp.GitSrcBranchName, expressApp.GitCloneFolder);
     wait.for(make_ExecuteExpressAppBuildScripts, expressApp);
     } catch (ex) {
     util_Fatal(ex);
     }
     });
     containerConfig.ExpressApps.forEach(function (expressApp) {
     //At this time (11-JUN-2015) running scripts in npm package.json files blows slc deployment
     //(the app uploads but is not startable) when running a 'prepublish:' bower script. Since
     //this is a pretty popular thing to do we're opting to not allow scripts to be run for now.
     //var argv = ['--scripts'];
     var argv = [];
     argv.unshift(process.argv[1]);
     argv.unshift(process.argv[0]);
     wait.for(make_StrongBuild, argv, expressApp.GitCloneFolder);
     });
     containerConfig.ExpressApps.forEach(function (expressApp) {
     var strongLoopServerUrl = expressApp.StrongLoopServerUrl || 'http://localhost:8701';
     var url = requireCache('url');
     var path = requireCache('path');
     var serviceName = expressApp.ServiceName || path.basename(url.parse(expressApp.GitUrl).path);
     var strongLoopBranchName = expressApp.StrongLoopBranchName || 'deploy';
     wait.for(make_StrongDeploy, expressApp.GitCloneFolder, strongLoopServerUrl, serviceName, strongLoopBranchName);
     });
     });*/
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
      log.fatal('Linked container dependency sort failed. You are probably trying to link to an unknown container.');
    }
    return sorted;
  }
}

