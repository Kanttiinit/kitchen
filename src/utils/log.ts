import * as moment from 'moment';
import * as fs from 'fs';

const maxLines = 1000;
let loggedRows = [];

export const log = (type: string, message: string, error: boolean = false) => {
  const str = `${error ? 'ERROR ' : ''}[${moment().format(
    'DD.MM.YYYY HH:mm:ss'
  )}] ${type}: ${message}`;
  console.log(str);
  loggedRows.push(str);
  loggedRows = loggedRows.slice(-maxLines);
  fs.writeFileSync(`${type}.log`, loggedRows.join('\n'));
};

export const createLogger = (type: string) => (
  message: string,
  error: boolean = false
) => log(type, message, error);
