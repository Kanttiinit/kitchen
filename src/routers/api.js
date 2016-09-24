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
.get('/favorites', (req, res) => {
  models.Favorite.findAll()
  .then(favorites =>
    res.json(getPublics(favorites, req.lang))
  );
})
.get('/areas', (req, res) => {
  models.Area.findAll({include: [{model: models.Restaurant}]})
  .then(areas =>
    res.json(getPublics(areas, req.lang))
  );
})
.get('/restaurants', (req, res) => {
  let queryPromise;
  if (req.query.location) {
    const [latitude, longitude] = req.query.location.split(',');
    queryPromise = models.sequelize.query({
      query: `SELECT *,
      (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance
      FROM restaurants ORDER BY distance;`,
      replacements: {latitude, longitude}
    }, {
      model: models.Restaurant,
      mapToModel: true,
      replacements: {latitude, longitude}
    });
  } else {
    queryPromise = models.Restaurant.findAll({
      order: [['AreaId', 'ASC'], ['name', 'ASC']]
    });
  }
  queryPromise.then(restaurants =>
    res.json(getPublics(restaurants, req.lang))
  );
});
