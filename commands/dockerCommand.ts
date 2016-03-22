///<reference path="commandImpl.ts"/>
import {CommandImpl} from "./commandImpl";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
import Argv = yargs.Argv;
import {DockerDescriptors} from "../util/docker-descriptors";
export class DockerCommand extends CommandImpl {
    static docker = new (require('dockerode'))({socketPath: '/var/run/docker.sock'});
    constructor() {
        super();
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
        DockerCommand.docker.listContainers({all:argv.a}, (err, containers)=>{
            console.dir(containers);
        });
    }
    prettyPrintDockerContainerList(containers, noprint, all) {
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
}

