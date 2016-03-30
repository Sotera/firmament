export interface Command {
  aliases: string[];
  command: string;
  commandDesc: string;
  handler: (argv:any)=>void;
  builder: any;
  subCommands: Command[]
}
