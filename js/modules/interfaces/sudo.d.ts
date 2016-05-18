export interface Sudo {
    spawnSync(cmd: string[]): any;
    spawn(cmd: string[], cb: (err?: Error) => void): any;
}
