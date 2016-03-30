export interface Command {
  aliases: string[];
  command: string;
  commandDesc: string;
  handler: (argv:any)=>void;
  options: any;
  subCommands: Command[]
}
