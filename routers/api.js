const express = require('express');
const models = require('../models');
const createModelRouter = require('../utils/createModelRouter');

module.exports = express.Router()
.use(require('./menus'))
.use(require('./restaurantMenu'))
.use(createModelRouter({model: models.Favorite}))
.use(
  createModelRouter({
    model: models.Area,
    getListQuery: () => ({include: [{model: models.Restaurant}]})
  })
)
.use(
  createModelRouter({
    model: models.Restaurant,
    getListQuery(req) {
      if (req.query.location) {
        const [latitude, longitude] = req.query.location.split(',');
        return {
          query: `SELECT *,
          (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance
          FROM restaurants ORDER BY distance;`,
          replacements: {latitude, longitude}
        };
      } else {
        return {
          include: req.loggedIn ? [{model: models.Area}] : [],
          order: [['AreaId', 'ASC'], ['name', 'ASC']]
        };
      }
    }
  })
);
