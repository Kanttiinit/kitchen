const Dropbox = require('dropbox');
import * as moment from 'moment';
import * as models from '../models';

const dropbox = new Dropbox({accessToken: process.env.DROPBOX_TOKEN});

models.sequelize.sync().then(async () => {
  const areas = await models.Area.findAll({raw: true});
  const restaurants = await models.Restaurant.findAll({raw: true});
  const favorites = await models.Favorite.findAll({raw: true});
  const path = '/' + moment().format('DD-MM-YYYY_HH-mm-ss');
  await dropbox.filesUpload({
    path,
    contents: JSON.stringify({areas, restaurants, favorites})
  });
  models.sequelize.close();
  process.exit();
});
