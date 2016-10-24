import {Vita} from "../interfaces/vita";
import {CommandImpl} from 'firmament-yargs';

export class VitaImpl extends CommandImpl implements Vita {
  run(cb): boolean {
    var glob = require('glob');
    var async = require('async');
    var vita = require('../../../vita.json');
    var fnArray = [];
    vita.encryptedFileFolders.forEach(encryptedFileFolder=> {
      encryptedFileFolder += '/*.enc';
      fnArray.push(async.apply(glob, encryptedFileFolder));
    });
    async.parallel(fnArray, (err, fileArrays)=> {
      var files = [];
      fileArrays.forEach(fileArray=>{
        //console.log(fileArray);
        files = files.concat(fileArray);
      });
      console.log(files);
      cb();
    });
    return true;
  }

  constructor() {
    super();
  }
}
