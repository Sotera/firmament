///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import Argv = yargs.Argv;
export class DockerCommand extends CommandImpl {
    static docker = new (require('dockerode'))({socketPath: '/var/run/docker.sock'});

    constructor() {
        super();
        this.setupConsoleTable();
        this.buildCommandTree();
    }

    private buildCommandTree() {
        this.aliases = ['d', 'docker'];
        this.command = '<subCommand>';
        this.commandDesc = 'Support for working with Docker containers';
        this.pushPsCommand();
    };

    private pushPsCommand() {
        let psCommand = new CommandImpl();
        psCommand.aliases = ['ps'];
        psCommand.commandDesc = 'List Docker containers';
        psCommand.builder = {
            all: {
                alias: 'a',
                boolean: true,
                default: false,
                desc: 'Show non-running containers also'
            }
        };
        psCommand.handler = (argv:yargs.Argv)=> this.listContainers(argv);
        this.subCommands.push(psCommand);
    };

    private listContainers(argv:any) {
        let allContainers = argv.a;
        DockerCommand.docker.listContainers({all: allContainers}, (err, containers)=> {
            this.prettyPrintDockerContainerList(containers, false, allContainers);
        });
    }

    private prettyPrintDockerContainerList(containers, noprint:boolean, all:boolean) {
        console.log('');//Line feed
        if (!containers || !containers.length) {
            if (!noprint) {
                console.log('No ' + (all ? '' : 'Running ') + 'Containers\n');
            }
            return [];
        }
        containers.sort(function (a, b) {
            return (a.Id < b.Id) ? -1 : 1
        });
        var displayContainers = [];
        var ourId = 0;
        containers.forEach(function (container) {
            var ourIdString = (++ourId).toString();
            var displayContainer = {
                ID: ourIdString,
                Name: container.Names[0],
                Image: container.Image,
                DockerId: container.Id.substring(0, 11),
                Status: container.Status
            };
            displayContainers.push(displayContainer);
        });
        if (!noprint) {
            console.table(displayContainers);
        }
        return displayContainers;
    }

    private setupConsoleTable() {
        if (typeof console === 'undefined') {
            throw new Error('Weird, console object is undefined');
        }
        if (typeof console.table === 'function') {
            return;
        }
        var table = require('easy-table');

        function arrayToString(arr) {
            var t = new table();
            arr.forEach(function (record) {
                if (typeof record === 'string' ||
                    typeof record === 'number') {
                    t.cell('item', record);
                } else {
                    // assume plain object
                    Object.keys(record).forEach(function (property) {
                        t.cell(property, record[property]);
                    });
                }
                t.newRow();
            });
            return t.toString();
        }

        function printTitleTable(title, arr) {
            var str = arrayToString(arr);
            var rowLength = str.indexOf('\n');
            if (rowLength > 0) {
                if (title.length > rowLength) {
                    rowLength = title.length;
                }
                console.log(title);
                var sep = '-', k, line = '';
                for (k = 0; k < rowLength; k += 1) {
                    line += sep;
                }
                console.log(line);
            }
            console.log(str);
        }

        function objectToArray(obj) {
            var keys = Object.keys(obj);
            return keys.map(function (key) {
                return {
                    key: key,
                    value: obj[key]
                };
            });
        }

        function objectToString(obj) {
            return arrayToString(objectToArray(obj));
        }

        console.table = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args.length === 2 &&
                typeof args[0] === 'string' &&
                Array.isArray(args[1])) {
                return printTitleTable(args[0], args[1]);
            }
            args.forEach(function (k) {
                if (typeof k === 'string') {
                    return console.log(k);
                } else if (Array.isArray(k)) {
                    console.log(arrayToString(k));
                } else if (typeof k === 'object') {
                    console.log(objectToString(k));
                }
            });
        };
    }
}

