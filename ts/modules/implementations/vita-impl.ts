import {Vita} from "../interfaces/vita";
import {CommandImpl} from 'firmament-yargs';
export class VitaImpl extends CommandImpl implements Vita {
  run(): boolean {
    console.log('Vita!!');
    return true;
  }
  constructor() {
    super();
  }
}
