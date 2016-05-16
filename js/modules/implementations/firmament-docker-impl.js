"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var firmament_yargs_1 = require('firmament-yargs');
var async = require('async');
var deepExtend = require('deep-extend');
var positive = require('positive');
var childProcess = require('child_process');
var FirmamentDockerImpl = (function (_super) {
    __extends(FirmamentDockerImpl, _super);
    function FirmamentDockerImpl() {
        _super.call(this);
        this.dockerode = new (require('dockerode'))({ socketPath: '/var/run/docker.sock' });
    }
    FirmamentDockerImpl.prototype.createContainer = function (containerConfig, cb) {
        var fullContainerConfigCopy = { ExpressApps: [] };
        deepExtend(fullContainerConfigCopy, containerConfig);
        this.dockerode.createContainer(fullContainerConfigCopy, function (err, container) {
            cb(err, container);
        });
    };
    FirmamentDockerImpl.prototype.removeContainers = function (ids, cb) {
        var _this = this;
        var self = this;
        if (!ids.length) {
            console.log('Specify containers to remove by FirmamentId, Docker ID or Name. Or "*" to remove all.');
            return;
        }
        if (_.indexOf(ids, 'all') !== -1) {
            if (!positive("You're sure you want to remove all containers? [y/N] ", false)) {
                console.log('Operation canceled.');
                cb(null, null);
                return;
            }
            ids = null;
        }
        this.getContainers(ids, function (err, containers) {
            _this.logError(err);
            async.map(containers, function (containerOrErrorMsg, cb) {
                if (typeof containerOrErrorMsg === 'string') {
                    _this.logAndCallback(containerOrErrorMsg, cb, null, { msg: containerOrErrorMsg });
                }
                else {
                    containerOrErrorMsg.remove({ force: 1 }, function (err) {
                        var msg = 'Removing container "' + containerOrErrorMsg.name + '"';
                        self.logAndCallback(msg, cb, err, { msg: containerOrErrorMsg.name });
                    });
                }
            }, cb);
        });
    };
    FirmamentDockerImpl.prototype.startOrStopContainers = function (ids, start, cb) {
        var _this = this;
        this.getContainers(ids, function (err, containers) {
            _this.logError(err);
            async.mapSeries(containers, function (containerOrErrorMsg, cb) {
                if (typeof containerOrErrorMsg === 'string') {
                    _this.logAndCallback(containerOrErrorMsg, cb);
                }
                else {
                    var resultMessage_1 = 'Container "' + containerOrErrorMsg.name + '" ';
                    resultMessage_1 += start ? 'started.' : 'stopped.';
                    var fnStartStop = start
                        ? containerOrErrorMsg.start.bind(containerOrErrorMsg)
                        : containerOrErrorMsg.stop.bind(containerOrErrorMsg);
                    fnStartStop(function (err) {
                        _this.logAndCallback(_this.returnErrorStringOrMessage(err, resultMessage_1), cb);
                    });
                }
            }, cb);
        });
    };
    FirmamentDockerImpl.prototype.getContainers = function (ids, cb) {
        var _this = this;
        if (!ids) {
            this.listContainers(true, function (err, containers) {
                if (_this.callbackIfError(cb, err)) {
                    return;
                }
                ids = [];
                containers.forEach(function (container) {
                    ids.push(container.firmamentId);
                });
                _this.getContainers(ids, cb);
            });
            return;
        }
        var fnArray = ids.map(function (id) {
            return async.apply(_this.getContainer.bind(_this), id.toString());
        });
        async.series(fnArray, function (err, results) {
            if (!_this.callbackIfError(cb, err)) {
                cb(err, results.filter(function (result) { return !!result; }));
            }
        });
    };
    FirmamentDockerImpl.prototype.getContainer = function (id, cb) {
        var _this = this;
        var self = this;
        async.waterfall([
            function (cb) {
                self.listContainers(true, cb);
            },
            function (containers, cb) {
                var foundContainers = containers.filter(function (container) {
                    if (container.firmamentId === id) {
                        return true;
                    }
                    else {
                        for (var i = 0; i < container.Names.length; ++i) {
                            if (container.Names[i] === (id[0] === '/' ? id : '/' + id)) {
                                return true;
                            }
                        }
                        var lowerCaseId = id.toLowerCase();
                        var charCount = lowerCaseId.length;
                        if (charCount < 3) {
                            return false;
                        }
                        return container.Id.toLowerCase().substring(0, charCount) ===
                            lowerCaseId.substring(0, charCount);
                    }
                });
                if (foundContainers.length > 0) {
                    var containerObject = _this.dockerode.getContainer(foundContainers[0].Id);
                    containerObject.name = foundContainers[0].Names[0];
                    cb(null, containerObject);
                }
                else {
                    cb(null, 'Unable to find container: "' + id + '"');
                }
            }
        ], cb);
    };
    FirmamentDockerImpl.prototype.exec = function (id, command, cb) {
        var _this = this;
        this.getContainer(id, function (err, container) {
            if (_this.callbackIfError(cb, err)) {
                return;
            }
            childProcess.spawnSync('docker', ['exec', '-it', container.name.slice(1), command], {
                stdio: 'inherit'
            });
            cb(null, 0);
        });
    };
    FirmamentDockerImpl.prototype.listContainers = function (listAllContainers, cb) {
        var _this = this;
        this.dockerode.listContainers({ all: true }, function (err, allContainers) {
            if (_this.callbackIfError(cb, err)) {
                return;
            }
            allContainers.sort(function (a, b) {
                return a.Names[0].localeCompare(b.Names[0]);
            });
            var firmamentId = 0;
            var containers = allContainers.map(function (container) {
                container.firmamentId = (++firmamentId).toString();
                return (listAllContainers || (container.Status.substring(0, 2) === 'Up')) ? container : null;
            }).filter(function (container) {
                return !!container;
            });
            cb(null, containers);
        });
    };
    FirmamentDockerImpl.prototype.listImages = function (listAllImages, cb) {
        var _this = this;
        this.dockerode.listImages({ all: listAllImages }, function (err, images) {
            if (_this.callbackIfError(cb, err)) {
                return;
            }
            images.sort(function (a, b) {
                return a.RepoTags[0].localeCompare(b.RepoTags[0]);
            });
            var firmamentId = 0;
            images = images.map(function (image) {
                image.firmamentId = (++firmamentId).toString();
                return image;
            }).filter(function (image) {
                return image !== null;
            });
            cb(null, images);
        });
    };
    FirmamentDockerImpl.prototype.buildDockerFile = function (dockerFilePath, dockerImageName, progressCb, cb) {
        try {
            require('fs').statSync(dockerFilePath);
        }
        catch (err) {
            if (this.callbackIfError(cb, err)) {
                return;
            }
        }
        try {
            var tar = require('tar-fs');
            var tarStream = tar.pack(dockerFilePath);
            tarStream.on('error', function (err) {
                cb(err);
            });
            this.dockerode.buildImage(tarStream, {
                t: dockerImageName
            }, function (err, outputStream) {
                if (err) {
                    cb(err);
                    return;
                }
                var error = null;
                outputStream.on('data', function (chunk) {
                    try {
                        var data = JSON.parse(chunk);
                        if (data.error) {
                            error = data.error;
                            return;
                        }
                        if (data.status == 'Downloading' || data.status == 'Extracting') {
                            progressCb(data.id, data.status, data.progressDetail.current, data.progressDetail.total);
                        }
                    }
                    catch (err) {
                        error = err;
                    }
                });
                outputStream.on('end', function () {
                    cb(error
                        && error.message
                        && error.message.indexOf('not found in repository') === -1
                        ? error
                        : null);
                });
                outputStream.on('error', function () {
                    this.callbackIfError(cb, new Error("Error creating image: '" + dockerImageName + "'"));
                });
            });
        }
        catch (err) {
            this.callbackIfError(cb, err);
        }
    };
    FirmamentDockerImpl.prototype.pullImage = function (imageName, progressCb, cb) {
        this.dockerode.pull(imageName, function (err, outputStream) {
            var error = null;
            if (err) {
                cb(err);
                return;
            }
            outputStream.on('data', function (chunk) {
                try {
                    var data = JSON.parse(chunk);
                    if (data.error) {
                        error = new Error(data.error);
                        return;
                    }
                    if (data.status === 'Downloading' || data.status === 'Extracting') {
                        progressCb(data.id, data.status, data.progressDetail.current, data.progressDetail.total);
                    }
                }
                catch (err) {
                    error = err;
                }
            });
            outputStream.on('end', function () {
                cb(error);
            });
            outputStream.on('error', function () {
                var msg = "Unable to pull image: '" + imageName + "'";
                cb(new Error(msg));
            });
        });
    };
    return FirmamentDockerImpl;
}(firmament_yargs_1.CommandImpl));
exports.FirmamentDockerImpl = FirmamentDockerImpl;
//# sourceMappingURL=firmament-docker-impl.js.map