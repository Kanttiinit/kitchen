const express = require('express');
const models = require('../models');
const worker = require('../parser/worker');
const sequelize = require('sequelize');
const cors = require('cors');
const imageGenerator = require('../image-generator');
const utils = require('../utils');
const haversine = require('haversine');

module.exports = express.Router()
.param('areaId', utils.getParamParser('Area', 'areaId'))
.get('/areas', cors(), (req, res) => {
   utils.track('/areas');
   models.Area.findAll({
      attributes: models.Area.getPublicAttributes(),
      include: [
         {
            model: models.Restaurant,
            attributes: models.Restaurant.getPublicAttributes()
         }
      ]
   })
   .then(areas => res.json(areas));
})
.post('/areas', utils.auth(), (req, res) => {
   models.Area.create(req.body)
   .then(area => res.json(area));
})
.delete('/areas/:areaId', utils.auth(), (req, res) => {
   req.area.destroy().then(_ => res.json({message: 'deleted'}));
})
.put('/areas/:areaId', utils.auth(), (req, res) => {
   req.area.update(req.body)
   .then(area => res.json(area));
})

.get('/menus/:restaurantIds', cors(), (req, res) => {
   const ids = req.params.restaurantIds.split(',');
   utils.track('/menus', req.params.restaurantIds);
   if (ids.every(n => !isNaN(n))) {
      models.Restaurant.findAll({
         where: {
            id: {$in: ids.map(n => +n)}
         },
         attributes: models.Restaurant.getPublicAttributes(),
         include: [
            {
               required: false,
               model: models.Menu,
               attributes: ['date', 'day', 'courses'],
               where: {
                  date: { $gte: sequelize.fn('date_trunc', 'day', sequelize.fn('now')) }
               }
            }
         ],
         order: sequelize.col('date')
      })
      .then(restaurants => res.json(restaurants));
   } else {
      res.status(400).json({message: 'invalid list of restaurant ids'});
   }
})

.param('favoriteId', utils.getParamParser('Favorite', 'favoriteId'))
.get('/favorites', (req, res) => {
   models.Favorite.findAll({attributes: models.Favorite.getPublicAttributes()})
   .then(restaurants => res.json(restaurants));
})
.post('/favorites', utils.auth(), (req, res) => {
   models.Favorite.create(req.body)
   .then(favorite => res.json(favorite));
})
.delete('/favorites/:favoriteId', utils.auth(), (req, res) => {
   req.favorite.destroy().then(_ => res.json({message: 'deleted'}));
})
.put('/favorites/:favoriteId', utils.auth(), (req, res) => {
   req.favorite.update(req.body)
   .then(favorite => res.json(favorite));
})

.param('restaurantId', utils.getParamParser('Restaurant', 'restaurantId'))
.get('/restaurants', utils.auth(true), (req, res) => {
   models.Restaurant.findAll({
      include: req.loggedIn ? [{model: models.Area}] : [],
      attributes: req.loggedIn ? undefined : models.Restaurant.getPublicAttributes(),
      order: [['AreaId', 'ASC'], ['name', 'ASC']]
   })
   .then(restaurants => {
      if (req.query.location) {
         const coords = req.query.location.split(',').map(n => +n);
         restaurants = restaurants.map(r => {
            r.distance = haversine({latitude: coords[0], longitude: coords[1]}, r);
            return r;
         })
         .sort((a, b) => a.distance - b.distance);
      }
      res.json(restaurants);
   });
})
.get('/restaurants/:restaurantId/image/', utils.auth(true), (req, res) => {
   const skipCache = req.query['skip-cache'];
   imageGenerator(skipCache, req.params.restaurantId, req.query.day)
   .then(data => {
      if (skipCache)
         data.pipe(res);
      else
         res.redirect(data);
   });
})
.post('/restaurants', utils.auth(), (req, res) => {
   req.body.openingHours = req.body.openingHours ? JSON.parse(req.body.openingHours) : [];
   models.Restaurant.create(req.body)
   .then(restaurant => res.json(restaurant));
})
.post('/restaurants/update', utils.auth(), (req, res) => {
   worker.updateAllRestaurants()
   .then(_ => res.json({message: 'ok'}));
})
.delete('/restaurants/:restaurantId', utils.auth(), (req, res) => {
   req.restaurant.destroy().then(_ => res.json({message: 'deleted'}));
})
.put('/restaurants/:restaurantId', utils.auth(), (req, res) => {
   req.body.openingHours = JSON.parse(req.body.openingHours);
   req.restaurant.update(req.body)
   .then(restaurant => res.json(restaurant));
});
