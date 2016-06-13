"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firmament_yargs_1 = require('firmament-yargs');
var firmament_docker_1 = require("firmament-docker");
var log = require('jsnlog').JL();
var async = require('async');
var request = require('request');
var fs = require('fs');
var positive = require('positive');
var _ = require('lodash');
var MakeCommand = (function (_super) {
    __extends(MakeCommand, _super);
    function MakeCommand() {
        _super.call(this);
        this.firmamentDocker = new firmament_docker_1.FirmamentDockerImpl();
        this.buildCommandTree();
    }
    MakeCommand.prototype.buildCommandTree = function () {
        this.aliases = ['make', 'm'];
        this.command = '<subCommand>';
        this.commandDesc = 'Support for building Docker container clusters';
        this.pushBuildCommand();
        this.pushTemplateCommand();
    };
    ;
    MakeCommand.prototype.pushTemplateCommand = function () {
        var _this = this;
        var templateCommand = new firmament_yargs_1.CommandImpl();
        templateCommand.aliases = ['template', 't'];
        templateCommand.commandDesc = 'Create a template JSON spec for a container cluster';
        templateCommand.options = {
            get: {
                alias: 'g',
                type: 'string',
                desc: 'Get a container cluster template from GitHub (use -ls to list available templates)'
            },
            ls: {
                type: 'boolean',
                default: false,
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
                type: 'boolean',
                default: false,
                desc: 'Create a full JSON template with all Docker options set to reasonable defaults'
            }
        };
        templateCommand.handler = function (argv) { return _this.makeTemplate(argv); };
        this.subCommands.push(templateCommand);
    };
    ;
    MakeCommand.prototype.pushBuildCommand = function () {
        var _this = this;
        var buildCommand = new firmament_yargs_1.CommandImpl();
        buildCommand.aliases = ['build', 'b'];
        buildCommand.commandDesc = 'Build Docker containers based on JSON spec';
        buildCommand.options = {
            input: {
                alias: 'i',
                default: MakeCommand.defaultConfigFilename,
                type: 'string',
                desc: 'Name the config JSON file'
            }
        };
        buildCommand.handler = function (argv) { return _this.buildTemplate(argv); };
        this.subCommands.push(buildCommand);
    };
    ;
    MakeCommand.prototype.buildTemplate = function (argv) {
        var fullInputPath = MakeCommand.getJsonConfigFilePath(argv.input);
        console.log("Constructing Docker containers described in: '" + fullInputPath + "'");
        var jsonFile = require('jsonfile');
        var containerDescriptors = jsonFile.readFileSync(fullInputPath);
        this.processContainerConfigs(containerDescriptors);
    };
    MakeCommand.prototype.makeTemplate = function (argv) {
        var _this = this;
        var fullOutputPath = MakeCommand.getJsonConfigFilePath(argv.output);
        var objectToWrite = argv.full
            ? firmament_docker_1.DockerDescriptors.dockerContainerDefaultTemplate
            : firmament_docker_1.DockerDescriptors.dockerContainerConfigTemplate;
        if (argv.ls) {
            var templateCatalogUrl = 'https://raw.githubusercontent.com/Sotera/firmament/typescript/docker/templateCatalog.json';
            request(templateCatalogUrl, function (err, res, body) {
                try {
                    var templateCatalog = JSON.parse(body);
                    console.log('\nAvailable templates:\n');
                    templateCatalog.forEach(function (template) {
                        console.log('> ' + template.name);
                    });
                }
                catch (e) {
                    console.log('\nError getting template catalog.\n');
                }
                _this.processExit();
            });
        }
        else {
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
    };
    MakeCommand.getJsonConfigFilePath = function (filename) {
        var path = require('path');
        var cwd = process.cwd();
        var regex = new RegExp('(.*)\\' + MakeCommand.jsonFileExtension + '$', 'i');
        if (regex.test(filename)) {
            filename = filename.replace(regex, '$1' + MakeCommand.jsonFileExtension);
        }
        else {
            filename = filename + MakeCommand.jsonFileExtension;
        }
        return path.resolve(cwd, filename);
    };
    MakeCommand.prototype.processContainerConfigs = function (containerConfigs) {
        var _this = this;
        var self = this;
        var containerConfigsByImageName = {};
        containerConfigs.forEach(function (containerConfig) {
            containerConfigsByImageName[containerConfig.Image] = containerConfig;
        });
        async.waterfall([
            function (cb) {
                _this.firmamentDocker.removeContainers(containerConfigs.map(function (containerConfig) { return containerConfig.name; }), cb);
            },
            function (containerRemoveResults, cb) {
                _this.firmamentDocker.listImages(false, function (err, images) {
                    if (self.callbackIfError(cb, err)) {
                        return;
                    }
                    var repoTags = {};
                    images.forEach(function (dockerImage) {
                        repoTags[dockerImage.RepoTags[0]] = true;
                    });
                    var missingImageNames = [];
                    containerConfigs.forEach(function (containerConfig) {
                        var imageName = (containerConfig.Image.indexOf(':') == -1)
                            ? containerConfig.Image + ':latest'
                            : containerConfig.Image;
                        if (!repoTags[imageName]) {
                            missingImageNames.push(imageName);
                        }
                    });
                    cb(null, _.uniq(missingImageNames));
                });
            },
            function (missingImageNames, cb) {
                async.mapSeries(missingImageNames, function (missingImageName, cb) {
                    _this.firmamentDocker.pullImage(missingImageName, function (taskId, status, current, total) {
                        MakeCommand.progressBar.showProgressForTask(taskId, status, current, total);
                    }, function (err) {
                        cb(null, err ? missingImageName : null);
                    });
                }, function (err, missingImageNames) {
                    if (self.callbackIfError(cb, err)) {
                        return;
                    }
                    cb(null, missingImageNames.filter(function (missingImageName) { return !!missingImageName; }));
                });
            },
            function (missingImageNames, cb) {
                async.mapSeries(missingImageNames, function (missingImageName, cb) {
                    var containerConfig = containerConfigsByImageName[missingImageName];
                    var path = require('path');
                    var cwd = process.cwd();
                    var dockerFilePath = path.join(cwd, containerConfig.DockerFilePath);
                    var dockerImageName = containerConfig.Image;
                    _this.firmamentDocker.buildDockerFile(dockerFilePath, dockerImageName, function (taskId, status, current, total) {
                        MakeCommand.progressBar.showProgressForTask(taskId, status, current, total);
                    }, function (err) {
                        cb(null, err
                            ? new Error('Unable to build Dockerfile at "' + dockerFilePath + '" because: ' + err.message)
                            : null);
                    });
                }, function (err, errors) {
                    if (self.callbackIfError(cb, err)) {
                        return;
                    }
                    errors = errors.filter(function (error) { return !!error; });
                    cb(self.logErrors(errors).length ? new Error() : null, errors);
                });
            },
            function (errs, cb) {
                try {
                    var sortedContainerConfigs_1 = self.containerDependencySort(containerConfigs);
                    async.mapSeries(sortedContainerConfigs_1, function (containerConfig, cb) {
                        _this.firmamentDocker.createContainer(containerConfig, function (err, container) {
                            self.logAndCallback('Container "' + containerConfig.name + '" created.', cb, err, container);
                        });
                    }, function (err, containers) {
                        if (self.callbackIfError(cb, err)) {
                            return;
                        }
                        var sortedContainerNames = sortedContainerConfigs_1.map(function (containerConfig) { return containerConfig.name; });
                        _this.firmamentDocker.startOrStopContainers(sortedContainerNames, true, function () {
                            cb(null, null);
                        });
                    });
                }
                catch (err) {
                    self.callbackIfError(cb, err);
                }
            },
            function deployExpressApps(errs, cb) {
                async.mapSeries(containerConfigs, function (containerConfig, cb) {
                    async.mapSeries(containerConfig.ExpressApps || [], function (expressApp, cb) {
                        async.series([
                            function (cb) {
                                var cwd = process.cwd();
                                var serviceName = expressApp.ServiceName;
                                if (expressApp.DeployExisting) {
                                    var serviceSourceFolders = fs.readdirSync(cwd).filter(function (fileName) {
                                        return fileName.substring(0, serviceName.length) === serviceName;
                                    });
                                    if (serviceSourceFolders.length > 1) {
                                        var msg = 'DeployExisting was specified but there is more than one service named: ';
                                        msg += serviceName + ': ' + serviceSourceFolders + '. Delete all but one and retry.';
                                        cb(new Error(msg));
                                        return;
                                    }
                                    else if (serviceSourceFolders.length > 0) {
                                        expressApp.GitCloneFolder = cwd + '/' + serviceSourceFolders[0];
                                        cb(null);
                                        return;
                                    }
                                }
                                expressApp.GitCloneFolder = cwd + '/' + expressApp.ServiceName + (new Date()).getTime();
                                cb(null);
                            },
                            function (cb) {
                                fs.stat(expressApp.GitCloneFolder, function (err, stats) {
                                    if (err) {
                                        self.gitClone(expressApp.GitUrl, expressApp.GitSrcBranchName, expressApp.GitCloneFolder, function (err) {
                                            cb(err);
                                        });
                                    }
                                    else {
                                        cb(null);
                                    }
                                });
                            },
                            function (cb) {
                                var retries = 3;
                                (function checkForStrongloop() {
                                    self.remoteSlcCtlCommand('Looking for SLC PM ...', expressApp, ['info'], function (err, result) {
                                        --retries;
                                        var errorMsg = 'Strongloop not available';
                                        var readyResult = /Driver Status:\s+running/;
                                        if (err) {
                                            cb(new Error(err.message), errorMsg);
                                            setTimeout(checkForStrongloop, 3000);
                                        }
                                        else if (readyResult.test(result)) {
                                            cb(null, 'Strongloop ready.');
                                        }
                                        else if (retries < 0) {
                                            cb(new Error(errorMsg), errorMsg);
                                        }
                                        else {
                                            setTimeout(checkForStrongloop, 3000);
                                        }
                                    });
                                })();
                            },
                            function (cb) {
                                var serviceName = expressApp.ServiceName;
                                var msg = 'Creating ' + serviceName;
                                self.remoteSlcCtlCommand(msg, expressApp, ['create', serviceName], cb);
                            },
                            function (cb) {
                                if (!expressApp.ClusterSize) {
                                    cb(null);
                                    return;
                                }
                                var clusterSize = expressApp.ClusterSize.toString();
                                self.remoteSlcCtlCommand('Setting cluster size to: ' + clusterSize, expressApp, ['set-size', expressApp.ServiceName, clusterSize], cb);
                            },
                            function (cb) {
                                expressApp.EnvironmentVariables = expressApp.EnvironmentVariables || {};
                                var cmd = ['env-set', expressApp.ServiceName];
                                for (var environmentVariable in expressApp.EnvironmentVariables) {
                                    cmd.push(environmentVariable
                                        + '='
                                        + expressApp.EnvironmentVariables[environmentVariable]);
                                }
                                self.remoteSlcCtlCommand('Setting environment variables', expressApp, cmd, cb);
                            },
                            function (cb) {
                                if (!expressApp.DoBowerInstall) {
                                    cb(null);
                                    return;
                                }
                                var cwd = expressApp.GitCloneFolder;
                                self.spawnShellCommand(['bower', 'install', '--config.interactive=false'], {
                                    cwd: cwd,
                                    stdio: null
                                }, cb);
                            },
                            function (cb) {
                                var cwd = expressApp.GitCloneFolder;
                                self.spawnShellCommand(['npm', 'install', '--ignore-scripts'], { cwd: cwd, stdio: null }, cb);
                            },
                            function (cb) {
                                async.mapSeries(expressApp.Scripts || [], function (script, cb) {
                                    var cwd = expressApp.GitCloneFolder + '/' + script.RelativeWorkingDir;
                                    var cmd = [script.Command];
                                    cmd = cmd.concat(script.Args);
                                    self.spawnShellCommand(cmd, { cwd: cwd, stdio: null }, cb);
                                }, function (err, results) {
                                    cb(err, null);
                                });
                            },
                            function (cb) {
                                var cwd = expressApp.GitCloneFolder;
                                self.spawnShellCommand(['slc', 'build', '--scripts'], { cwd: cwd, stdio: null }, cb);
                            },
                            function (cb) {
                                var cwd = expressApp.GitCloneFolder;
                                console.log('StrongLoop Deploying @ ' + cwd);
                                self.spawnShellCommand(['slc', 'deploy', '--service=' + expressApp.ServiceName,
                                    expressApp.StrongLoopServerUrl], {
                                    cwd: cwd,
                                    stdio: null
                                }, cb);
                            }
                        ], cb);
                    }, cb);
                }, cb);
            }
        ], function (err, results) {
            self.processExitWithError(err);
        });
    };
    MakeCommand.writeJsonTemplateFile = function (objectToWrite, fullOutputPath) {
        console.log("Writing JSON template file '" + fullOutputPath + "' ...");
        var jsonFile = require('jsonfile');
        jsonFile.spaces = 2;
        jsonFile.writeFileSync(fullOutputPath, objectToWrite);
    };
    MakeCommand.prototype.remoteSlcCtlCommand = function (msg, expressApp, cmd, cb) {
        var cwd = expressApp.GitCloneFolder;
        var serviceName = expressApp.ServiceName;
        var serverUrl = expressApp.StrongLoopServerUrl;
        console.log(msg + ' "' + serviceName + '" @ "' + cwd + '" via "' + serverUrl + '"');
        var baseCmd = ['slc', 'ctl', '-C', serverUrl];
        Array.prototype.push.apply(baseCmd, cmd);
        this.spawnShellCommandAsync(baseCmd, { cwd: cwd, stdio: 'pipe' }, function (err, result) {
            console.log(result);
            cb(err, result);
        });
    };
    MakeCommand.prototype.containerDependencySort = function (containerConfigs) {
        var sortedContainerConfigs = [];
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
    };
    MakeCommand.prototype.topologicalDependencySort = function (graph) {
        var sorted = [], visited = {};
        try {
            Object.keys(graph).forEach(function visit(name, ancestors) {
                if (visited[name]) {
                    return;
                }
                if (!Array.isArray(ancestors)) {
                    ancestors = [];
                }
                ancestors.push(name);
                visited[name] = true;
                var deps = graph[name];
                deps.forEach(function (dep) {
                    if (ancestors.indexOf(dep) >= 0) {
                        log.fatal('Circular dependency "' + dep + '" is required by "' + name + '": ' + ancestors.join(' -> '));
                    }
                    visit(dep, ancestors.slice(0));
                });
                sorted.push(name);
            });
        }
        catch (ex) {
            throw new Error('Linked container dependency sort failed. You are probably trying to link to an unknown container.');
        }
        return sorted;
    };
    MakeCommand.prototype.gitClone = function (gitUrl, gitBranch, localFolder, cb) {
        this.spawnShellCommand(['git', 'clone', '-b', gitBranch, '--single-branch', gitUrl, localFolder], { cwd: process.cwd(), stdio: 'pipe' }, cb);
    };
    MakeCommand.defaultConfigFilename = 'firmament.json';
    MakeCommand.jsonFileExtension = '.json';
    MakeCommand.progressBar = new firmament_yargs_1.ProgressBarImpl();
    return MakeCommand;
}(firmament_yargs_1.CommandImpl));
exports.MakeCommand = MakeCommand;
//# sourceMappingURL=makeCommand.js.map