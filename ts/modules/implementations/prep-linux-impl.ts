import {PrepLinux} from '../interfaces/prep-linux';
import {CommandImpl} from 'firmament-yargs';
export class PrepLinuxImpl extends CommandImpl implements PrepLinux {
  tmp(containerConfig:any, cb:(err:Error, container:any)=>void) {
  }

  constructor() {
    super();
  }
}
