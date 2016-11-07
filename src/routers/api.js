import express from 'express';
import models from '../models';

const getPublics = (items, lang) => items.map(item => item.getPublicAttributes(lang));

import menuRouter from './menus';
import restaurantMenuRouter from './restaurantMenu';

export default express.Router()
.use((req, res, next) => {
  if (['fi', 'en'].includes(req.query.lang))
    req.lang = req.query.lang;
  else
    req.lang = 'fi';
  next();
})
.use(menuRouter)
.use(restaurantMenuRouter)
.post('/location', async (req, res, next) => {
  const {latitude, longitude, userHash} = req.body;
  if (latitude && longitude && userHash) {
    await models.Location.create({latitude, longitude, userHash});
    res.json({message: 'Success.'});
  } else {
    next({code: 400, message: 'Missing field.'});
  }
})
.get('/favorites', async (req, res) => {
  const favorites = await models.Favorite.findAll();
  res.json(getPublics(favorites, req.lang));
})
.get('/areas', async (req, res) => {
  const areas = await models.Area.findAll({
    where: {hidden: false},
    include: [{model: models.Restaurant}]
  });
  res.json(getPublics(areas, req.lang));
})
.get('/restaurants', async (req, res) => {
  let queryPromise;
  if (req.query.location) {
    const [latitude, longitude] = req.query.location.split(',');
    queryPromise = models.sequelize.query({
      query: `
      SELECT *,
      (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance
      FROM restaurants
      WHERE hidden = false
      ORDER BY distance;
      `
    }, {
      model: models.Restaurant,
      mapToModel: true,
      replacements: {latitude, longitude}
    });
  } else {
    queryPromise = models.Restaurant.findAll({where: {hidden: false}});
  }
  const restaurants = await queryPromise;
  res.json(getPublics(restaurants, req.lang));
});
