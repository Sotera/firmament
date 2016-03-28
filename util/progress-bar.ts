//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
const multimeter = require('pm2-multimeter');
const multi = multimeter(process);
export class ProgressBar {
  private config = {
    width: 40,
    before: '[',
    after: ']',
    solid: {background: 'blue', foreground: 'white', text: '|'},
    empty: {background: null, foreground: null, text: ' '}
  };
  private progressBarMap = {};
  private offset:number = 0;

  public showProgressForTask(id:string, status:string, current:number, total:number) {
    let bar = this.progressBarMap[id];
    if (!bar) {
      multi.offset++;
      this.progressBarMap[id] = bar = multi.rel(2, this.offset++, this.config);
      console.log('>');// + id);
    }
    status = ' ** ' + id + ': ' + status + '                    ';
    bar.ratio(current, total, status);
  }
}
