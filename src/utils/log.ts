import * as moment from 'moment';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export const createLogger = (type: string, maxLines: number = 1000) => {
  const filename = `${type}.log`;
  let loggedRows = existsSync(filename) ? readFileSync(filename)
    .toString()
    .split('\n') : [];

  return (message: string, error: boolean = false) => {
    const timestamp = moment().format('DD.MM.YYYY HH:mm:ss');
    const str = `[${timestamp}]${error ? ' ERROR' : ''}: ${message}`;
    console.log(str);
    loggedRows.push(str);
    loggedRows = loggedRows.slice(-maxLines);
    writeFileSync(filename, loggedRows.join('\n'));
  };
};
