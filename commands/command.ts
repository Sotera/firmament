import Argv = yargs.Argv;
export interface Command {
  aliases: string[];
  command: string;
  commandDesc: string;
  handler: (argv:Argv)=>void;
  builder: any;
  subCommands: Command[]
}
