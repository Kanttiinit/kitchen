const express = require('express');
const models = require('../models');
const worker = require('../worker');
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
      attributes: ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius'],
      include: [
         {
            model: models.Restaurant,
            attributes: ['id', 'name', 'url', 'image', 'openingHours', 'latitude', 'longitude', 'address']
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
   req.area.destroy().then(() => res.json({message: 'deleted'}));
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
         attributes: ['id', 'name', 'image', 'url', 'latitude', 'longitude', 'openingHours', 'address'],
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
   models.Favorite.findAll({attributes: ['id', 'name', 'regexp', 'icon']})
   .then(restaurants => res.json(restaurants));
})
.post('/favorites', utils.auth(), (req, res) => {
   models.Favorite.create(req.body)
   .then(favorite => res.json(favorite));
})
.delete('/favorites/:favoriteId', utils.auth(), (req, res) => {
   req.favorite.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/favorites/:favoriteId', utils.auth(), (req, res) => {
   req.favorite.update(req.body)
   .then(favorite => res.json(favorite));
})

.param('restaurantId', utils.getParamParser('Restaurant', 'restaurantId'))
.get('/restaurants', utils.auth(true), (req, res) => {
   const include = req.loggedIn ? [{model: models.Area}] : [];
   const attributes = req.loggedIn ? undefined : ['id', 'name', 'latitude', 'longitude', 'address'];
   models.Restaurant.findAll({
      include,
      attributes,
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
.get('/restaurants/:restaurantId/image/', (req, res, next) => {
   imageGenerator(req.params.restaurantId, req.query.day)
   .then(url => {
      res.redirect(url);
   })
   .catch(next);
})
.post('/restaurants', utils.auth(), (req, res) => {
   req.body.openingHours = req.body.openingHours ? JSON.parse(req.body.openingHours) : [];
   models.Restaurant.create(req.body)
   .then(restaurant => {
      if (restaurant.menuUrl)
         worker.updateMenu(restaurant);
      res.json(restaurant);
   });
})
.post('/restaurants/update', utils.auth(), (req, res, next) => {
   worker.updateAllRestaurants()
   .then(_ => res.json({message: 'ok'}))
   .catch(next);
})
.delete('/restaurants/:restaurantId', utils.auth(), (req, res) => {
   req.restaurant.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/restaurants/:restaurantId', utils.auth(), (req, res) => {
   req.body.openingHours = JSON.parse(req.body.openingHours);
   req.restaurant.update(req.body)
   .then(restaurant => {
      if (restaurant.menuUrl)
         worker.updateMenu(restaurant);
      res.json(restaurant);
   });
});
