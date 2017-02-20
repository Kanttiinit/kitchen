import express from 'express';
import models from '../models';

const getPublics = (items, lang) => items.map(item => item.getPublicAttributes(lang));

import getMenus from './getMenus';
import getRestaurantMenus from './getRestaurantMenus';

export const parseLanguage = (req, res, next) => {
  if (['fi', 'en'].includes(req.query.lang))
    req.lang = req.query.lang;
  else
    req.lang = 'fi';
  next();
};

export const getFavorites = async (req, res) => {
  const favorites = await models.Favorite.findAll();
  res.json(getPublics(favorites, req.lang));
};

export const getAreas = async (req, res) => {
  const areas = await models.Area.findAll({
    where: {hidden: false},
    include: [{model: models.Restaurant}]
  });
  res.json(getPublics(areas, req.lang));
};

export const getRestaurants = async (req, res) => {
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
};

export default express.Router()
.use(parseLanguage)
.get('/menus', getMenus)
.get('/restaurants/:restaurantId/menu(.:ext)?', getRestaurantMenus)
.get('/favorites', getFavorites)
.get('/areas', getAreas)
.get('/restaurants', getRestaurants);
