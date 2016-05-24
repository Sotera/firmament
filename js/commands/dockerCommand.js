"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firmament_yargs_1 = require('firmament-yargs');
var firmament_docker_1 = require("firmament-docker");
var log = require('jsnlog').JL();
var DockerCommand = (function (_super) {
    __extends(DockerCommand, _super);
    function DockerCommand() {
        _super.call(this);
        this.firmamentDocker = new firmament_docker_1.FirmamentDockerImpl();
        log.trace('Constructing DockerCommand instance');
        this.buildCommandTree();
    }
    DockerCommand.prototype.buildCommandTree = function () {
        this.aliases = ['docker', 'd'];
        this.command = '<subCommand>';
        this.commandDesc = 'Support for working with Docker containers';
        this.pushCleanVolumesCommand();
        this.pushImagesCommand();
        this.pushPsCommand();
        this.pushStartCommand();
        this.pushStopCommand();
        this.pushRemoveContainersCommand();
        this.pushRemoveImagesCommand();
        this.pushShellCommand();
    };
    DockerCommand.prototype.pushCleanVolumesCommand = function () {
        var me = this;
        var cleanVolumesCommand = new firmament_yargs_1.CommandImpl();
        cleanVolumesCommand.aliases = ['clean-volumes', 'cv'];
        cleanVolumesCommand.commandDesc = 'Clean orphaned Docker resources';
        cleanVolumesCommand.handler = function (argv) {
            var script = require('path').join(__dirname, '../../legacy/_docker-cleanup-volumes.sh');
            me.sudoSpawn(['/bin/bash', '-c', script], function (err) {
                me.processExitWithError(err);
            });
        };
        this.subCommands.push(cleanVolumesCommand);
    };
    DockerCommand.prototype.pushRemoveImagesCommand = function () {
        var _this = this;
        var removeCommand = new firmament_yargs_1.CommandImpl();
        removeCommand.aliases = ['rmi'];
        removeCommand.commandDesc = 'Remove Docker images';
        removeCommand.handler = function (argv) {
            _this.firmamentDocker.removeImages(argv._.slice(2), function (err) {
                _this.processExitWithError(err);
            });
        };
        this.subCommands.push(removeCommand);
    };
    DockerCommand.prototype.pushRemoveContainersCommand = function () {
        var _this = this;
        var removeCommand = new firmament_yargs_1.CommandImpl();
        removeCommand.aliases = ['rm'];
        removeCommand.commandDesc = 'Remove Docker containers';
        removeCommand.handler = function (argv) {
            _this.firmamentDocker.removeContainers(argv._.slice(2), function (err) {
                _this.processExitWithError(err);
            });
        };
        this.subCommands.push(removeCommand);
    };
    DockerCommand.prototype.pushShellCommand = function () {
        var _this = this;
        var shellCommand = new firmament_yargs_1.CommandImpl();
        shellCommand.aliases = ['sh'];
        shellCommand.commandDesc = 'Run bash shell in Docker container';
        shellCommand.handler = function (argv) {
            _this.bashInToContainer(argv._.slice(2), function (err) {
                _this.processExitWithError(err);
            });
        };
        this.subCommands.push(shellCommand);
    };
    DockerCommand.prototype.pushStartCommand = function () {
        var _this = this;
        var startCommand = new firmament_yargs_1.CommandImpl();
        startCommand.aliases = ['start'];
        startCommand.commandDesc = 'Start Docker containers';
        startCommand.handler = function (argv) {
            _this.firmamentDocker.startOrStopContainers(argv._.slice(2), true, function () { return _this.processExit(); });
        };
        this.subCommands.push(startCommand);
    };
    DockerCommand.prototype.pushStopCommand = function () {
        var _this = this;
        var stopCommand = new firmament_yargs_1.CommandImpl();
        stopCommand.aliases = ['stop'];
        stopCommand.commandDesc = 'Stop Docker containers';
        stopCommand.handler = function (argv) {
            _this.firmamentDocker.startOrStopContainers(argv._.slice(2), false, function () { return _this.processExit(); });
        };
        this.subCommands.push(stopCommand);
    };
    DockerCommand.prototype.pushImagesCommand = function () {
        var _this = this;
        var imagesCommand = new firmament_yargs_1.CommandImpl();
        imagesCommand.aliases = ['images'];
        imagesCommand.commandDesc = 'List Docker images';
        imagesCommand.options = {
            all: {
                alias: 'a',
                boolean: true,
                default: false,
                desc: 'Show intermediate images also'
            }
        };
        imagesCommand.handler = function (argv) { return _this.printImagesList(argv, function () { return _this.processExit(); }); };
        this.subCommands.push(imagesCommand);
    };
    DockerCommand.prototype.pushPsCommand = function () {
        var _this = this;
        var psCommand = new firmament_yargs_1.CommandImpl();
        psCommand.aliases = ['ps'];
        psCommand.commandDesc = 'List Docker containers';
        psCommand.options = {
            all: {
                alias: 'a',
                boolean: true,
                default: false,
                desc: 'Show non-running containers also'
            }
        };
        psCommand.handler = function (argv) { return _this.printContainerList(argv, function () { return _this.processExit(); }); };
        this.subCommands.push(psCommand);
    };
    DockerCommand.prototype.printImagesList = function (argv, cb) {
        var _this = this;
        this.firmamentDocker.listImages(argv.a, function (err, images) {
            _this.prettyPrintDockerImagesList(err, images, cb);
        });
    };
    DockerCommand.prototype.printContainerList = function (argv, cb) {
        var _this = this;
        this.firmamentDocker.listContainers(argv.a, function (err, containers) {
            _this.prettyPrintDockerContainerList(err, containers, argv.a, cb);
        });
    };
    DockerCommand.prototype.bashInToContainer = function (ids, cb) {
        if (ids.length !== 1) {
            var msg = '\nSpecify container to shell into by FirmamentId, Docker ID or Name.\n';
            msg += '\nExample: $ ... d sh 2  <= Open bash shell in container with FirmamentId "2"\n';
            cb(new Error(msg));
            return;
        }
        this.firmamentDocker.exec(ids[0].toString(), '/bin/bash', cb);
    };
    DockerCommand.prototype.prettyPrintDockerImagesList = function (err, images, cb) {
        if (!images || !images.length) {
            var msg = this.returnErrorStringOrMessage(err, '\nNo images\n');
            console.log(msg);
        }
        else {
            var timeAgo = require('time-ago')();
            var fileSize = require('filesize');
            firmament_yargs_1.CommandLineImpl.printTable(images.map(function (image) {
                try {
                    var ID = image.firmamentId;
                    var repoTags = image.RepoTags[0].split(':');
                    var Repository = repoTags[0];
                    var Tag = repoTags[1];
                    var ImageId = image.Id.substring(7, 19);
                    var nowTicks = +new Date();
                    var tickDiff = nowTicks - (1000 * image.Created);
                    var Created = timeAgo.ago(nowTicks - tickDiff);
                    var Size = fileSize(image.Size);
                }
                catch (err) {
                    console.log(err.message);
                }
                return { ID: ID, Repository: Repository, Tag: Tag, ImageId: ImageId, Created: Created, Size: Size };
            }));
        }
        cb();
    };
    DockerCommand.prototype.prettyPrintDockerContainerList = function (err, containers, all, cb) {
        if (!containers || !containers.length) {
            var msg = this.returnErrorStringOrMessage(err, '\nNo ' + (all ? '' : 'Running ') + 'Containers\n');
            console.log(msg);
        }
        else {
            firmament_yargs_1.CommandLineImpl.printTable(containers.map(function (container) {
                return {
                    ID: container.firmamentId,
                    Name: container.Names[0],
                    Image: container.Image,
                    DockerId: container.Id.substring(0, 11),
                    Status: container.Status
                };
            }));
        }
        cb();
    };
    DockerCommand.docker = new (require('dockerode'))({ socketPath: '/var/run/docker.sock' });
    DockerCommand.progressBar = new firmament_yargs_1.ProgressBarImpl();
    return DockerCommand;
}(firmament_yargs_1.CommandImpl));
exports.DockerCommand = DockerCommand;
//# sourceMappingURL=dockerCommand.js.map