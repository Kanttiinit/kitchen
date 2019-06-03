import * as express from 'express';
import * as models from '../../models';
import { sortBy } from 'lodash';

const getPublics = (items, lang) =>
  items.map(item => item.getPublicAttributes(lang));

import changeRouter from './changeRouter';
import getMenus from './getMenus';
import getRestaurantMenus from './getRestaurantMenus';
import getRestaurants from './getRestaurants';
import handleRouteErrors from '../../utils/handleRouteErrors';

export const parseLanguage = (req, res, next) => {
  if (['fi', 'en'].indexOf(req.query.lang) > -1) {
    req.lang = req.query.lang;
  } else {
    req.lang = 'fi';
  }
  next();
};

export const getFavorites = async (req, res) => {
  const favorites = await models.Favorite.findAll();
  res.json(getPublics(favorites, req.lang));
};

export const getAreas = async (req, res) => {
  const areas = await models.Area.findAll({
    where: { hidden: false },
    include: [{ model: models.Restaurant }]
  });
  const data: any = await Promise.all(
    areas.map(area => area.getPublicAttributes(req.lang))
  );
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

export const getUpdates = async (req, res) => {
  const updates = await models.Update.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10
  });
  res.json(getPublics(updates, req.lang));
};

export default express
.Router()
.use(parseLanguage)
.use('/changes', handleRouteErrors(changeRouter))
.get('/menus', handleRouteErrors(getMenus))
.get(
  '/restaurants/:restaurantId/menu(.:ext)?',
  handleRouteErrors(getRestaurantMenus)
)
.get('/favorites', handleRouteErrors(getFavorites))
.get('/areas', handleRouteErrors(getAreas))
.get('/restaurants', handleRouteErrors(getRestaurants))
.get('/updates', handleRouteErrors(getUpdates));
