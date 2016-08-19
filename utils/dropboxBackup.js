const Dropbox = require('dropbox');
const {exec} = require('child_process');
const moment = require('moment');

const dropbox = new Dropbox({accessToken: process.env.DROPBOX_TOKEN});

const pg_dump = 'pg_dump ' + process.env.DATABASE_URL;

exec(pg_dump, (error, contents, stderr) => {
  const path = '/' + moment().format('DD-MM-YYYY_HH-mm-ss');
  dropbox.filesUpload({contents, path});
});
