import {injectable, inject} from 'inversify';
import {CommandUtil, Spawn} from 'firmament-yargs';
import {Package} from '../interfaces/Package';
import * as path from 'path';
import * as fs from 'fs';

@injectable()
export class PackageImpl implements Package {
  constructor(@inject('CommandUtil') private commandUtil: CommandUtil,
              @inject('Spawn') private spawn: Spawn) {
  }

  tar(argv: any) {
    const me = this;
    const serviceFolderToSend = path.resolve(__dirname, '../..');

    fs.stat(serviceFolderToSend, (err) => {
      me.commandUtil.processExitIfError(err);
      me.commandUtil.log(`Packaging folder ${serviceFolderToSend} ...`);
      try {
        const writer = fs.createWriteStream(argv.output);
        const pack = require('tar-pack').pack;
        const packStream = pack(serviceFolderToSend, {ignoreFiles: ['.tar-packignore']});
        writer
          .on('finish', () => {
            me.commandUtil.processExit(0, `${argv.output} written.`)
          });
        packStream.pipe(writer);
      } catch(err) {
        me.commandUtil.processExitWithError(err);
      }
    });
  }
}
