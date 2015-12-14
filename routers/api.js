const express = require('express');
const models = require('../models');
const worker = require('../worker');
const sequelize = require('sequelize');

const router = express.Router();

const auth = (req, res, next) => {
   req.loggedIn = req.session.loggedIn;
   if (req.session.loggedIn)
      next();
   else
      res.status(403).json({message: 'unauhtorized'});
};

router
.param('areaId', (req, res, next) => {
   models.Area.findById(req.params.areaId)
   .then(area => {
      if (area) {
         req.area = area;
         next();
      } else {
         res.status(404).json({message: 'no such area'});
      }
   });
})
.get('/areas', (req, res) => {
   models.Area.findAll({attributes: ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius']})
   .then(areas => res.json(areas));
})
.post('/areas', auth, (req, res) => {
   models.Area.create(req.body)
   .then(area => res.json(area));
})
.delete('/areas/:areaId', auth, (req, res) => {
   req.area.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/areas/:areaId', auth, (req, res) => {
   req.area.update(req.body)
   .then(area => res.json(area));
})
.get('/areas/:areaId/menus', (req, res) => {
   req.area.getRestaurants({
      attributes: ['id', 'name', 'image', 'url', 'latitude', 'longitude', 'openingHours'],
      include: [
         {
            model: models.Menu,
            where: {
               date: { $gte: sequelize.fn('date_trunc', 'day', sequelize.fn('now')) }
            }
         }
      ],
      order: sequelize.col('date')
   })
   .then(restaurants => res.json(restaurants));
})

.param('restaurantId', (req, res, next) => {
   models.Restaurant.findById(req.params.restaurantId)
   .then(restaurant => {
      if (restaurant) {
         req.restaurant = restaurant;
         next();
      } else {
         res.status(404).json({message: 'no such restaurant'});
      }
   });
})
.get('/restaurants', auth, (req, res) => {
   models.Restaurant.findAll({include: [{model: models.Area}]})
   .then(restaurants => res.json(restaurants));
})
.post('/restaurants', auth, (req, res) => {
   models.Restaurant.create(req.body)
   .then(restaurant => {
      worker(restaurant);
      res.json(restaurant);
   });
})
.post('/restaurants/fetch/:restaurantId', auth, (req, res) => {
   worker(req.restaurant, models)
   .then(() => res.json({message: 'ok'}));
})
.delete('/restaurants/:restaurantId', auth, (req, res) => {
   req.restaurant.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/restaurants/:restaurantId', auth, (req, res) => {
   req.restaurant.update(req.body)
   .then(restaurant => res.json(restaurant));
});

module.exports = router;
