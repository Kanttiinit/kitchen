import * as Dropbox from 'dropbox';
import {spawn} from 'child_process';
import * as moment from 'moment';

const dropbox = new Dropbox({accessToken: process.env.DROPBOX_TOKEN});

const pg_dump = spawn('pg_dump', ['-T menus', process.env.DATABASE_URL]);

let contents = '';
pg_dump.stdout.on('data', data => {
  contents += data.toString();
});

pg_dump.on('exit', () => {
  const path = '/' + moment().format('DD-MM-YYYY_HH-mm-ss');
  dropbox.filesUpload({contents, path});
});
