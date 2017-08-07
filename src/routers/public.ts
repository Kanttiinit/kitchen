import * as express from 'express';
import * as models from '../models';
import {sortBy} from 'lodash'

const getPublics = (items, lang) => items.map(item => item.getPublicAttributes(lang));

import getMenus from './getMenus';
import getRestaurantMenus from './getRestaurantMenus';

export const parseLanguage = (req, res, next) => {
  if (['fi', 'en'].indexOf(req.query.lang) > -1)
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
  const data = getPublics(areas, req.lang);
  if (req.query.idsOnly) {
    const ids = data.map(area => ({
      ...area,
      restaurants: sortBy(area.restaurants.map(r => r.id))
    }));
    res.json(ids);
  } else {
    res.json(data);
  }
};

export const getRestaurants = async (req, res, next) => {
  try {
    let queryPromise;
    if (req.query.location) {
      const [latitude, longitude] = req.query.location.split(',');
      const {distance = 2000} = req.query;
      if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
        next({code: 400, message: 'Bad request.'});
      } else {
        queryPromise = models.sequelize.query(`
          SELECT *
          FROM (
            SELECT *,
            (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance
            FROM restaurants
          ) as restaurants
          WHERE hidden = false AND distance < :distance
          ORDER BY distance;
        `, {
          model: models.Restaurant,
          mapToModel: true,
          replacements: {latitude, longitude, distance: distance / 1000}
        });
      }
    } else {
      const where: {id?: any, hidden: boolean} = {hidden: false};
      if (req.query.ids) {
        where.id = {$in: req.query.ids.split(',').filter(id => !isNaN(id)).map(id => Number(id))};
      }
      queryPromise = models.Restaurant.findAll({where});
    }
    const restaurants = await queryPromise;
    res.json(getPublics(restaurants, req.lang));
  } catch(e) {
    next(e);
  }
};

export default express.Router()
.use(parseLanguage)
.get('/menus', getMenus)
.get('/restaurants/:restaurantId/menu(.:ext)?', getRestaurantMenus)
.get('/favorites', getFavorites)
.get('/areas', getAreas)
.get('/restaurants', getRestaurants);
