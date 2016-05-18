export interface Sudo {
  spawnSync(cmd:string[]);
  spawn(cmd:string[], cb:(err?:Error)=>void);
}

