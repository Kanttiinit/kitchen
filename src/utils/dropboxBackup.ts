const Dropbox = require('dropbox');
import * as moment from 'moment';
import * as zlib from 'zlib';
import {promisify} from 'util';
import * as models from '../models';

const dropbox = new Dropbox({accessToken: process.env.DROPBOX_TOKEN});

const compress = (promisify as any)(zlib.deflate);

models.sequelize.sync().then(async () => {
  const areas = await models.Area.findAll({raw: true});
  const restaurants = await models.Restaurant.findAll({raw: true});
  const favorites = await models.Favorite.findAll({raw: true});
  const path = '/' + moment().format('DD-MM-YYYY_HH-mm-ss');
  const jsonString = JSON.stringify({areas, restaurants, favorites});
  const compressedData = await compress(jsonString);

  await dropbox.filesUpload({
    path,
    contents: compressedData.toString('base64')
  });
  models.sequelize.close();
  process.exit();
});
