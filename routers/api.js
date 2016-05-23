const express = require('express');
const models = require('../models');
const worker = require('../parser/worker');
const sequelize = require('sequelize');
const cors = require('cors');
const imageGenerator = require('../image-generator');
const utils = require('../utils');
const haversine = require('haversine');

const router = express.Router();

router.use((req, res, next) => {
   if (req.method === 'GET') {
      let fn = console.log;
      if (!req.loggedIn)
         fn = (...args) => visitor.event(...args).send();

      fn('API Call', req.originalUrl, req.get('User-Agent'));
   }
   next();
});

utils.createRestApi({
   router,
   model: models.Favorite
});

utils.createRestApi({
   router,
   model: models.Area,
   getListQuery(req) {
      return {
         include: [{model: models.Restaurant}]
      };
   }
});

utils.createRestApi({
   router,
   model: models.Restaurant,
   getListQuery(req) {
      return {
         include: req.loggedIn ? [{model: models.Area}] : [],
         order: [['AreaId', 'ASC'], ['name', 'ASC']]
      };
   },
   formatResponse(items, req) {
      if (req.query.location) {
         const coords = req.query.location.split(',').map(n => Number(n));
         return items
            .map(r => {
               r.distance = +haversine({latitude: coords[0], longitude: coords[1]}, r).toFixed(3);
               return r;
            })
            .sort((a, b) => a.distance - b.distance);
      }
      return items;
   }
})

module.exports = router
.get('/menus/:restaurantIds', cors(), (req, res) => {
   const ids = req.params.restaurantIds.split(',');
   utils.track('/menus', req.params.restaurantIds);
   if (ids.every(n => !isNaN(n))) {
      models.Restaurant.findAll({
         where: {
            id: {$in: ids.map(n => +n)}
         },
         include: [
            {
               required: false,
               model: models.Menu,
               where: {
                  date: {$gte: sequelize.fn('date_trunc', 'day', sequelize.fn('now'))}
               }
            }
         ],
         order: sequelize.col('date')
      })
      .then(restaurants => {
         res.json(restaurants.map(r => r.getPublicAttributes()));
      });
   } else {
      res.status(400).json({message: 'invalid list of restaurant ids'});
   }
})
.get('/restaurants/:restaurantId/image/', utils.auth(true), (req, res) => {
   imageGenerator({
      restaurantId: req.params.restaurantId,
      date: req.query.day,
      mode: req.query.mode,
      width: req.query.width
   }).then(data => {
      switch (req.query.mode) {
         case 'html':
            res.send(data);
            break;
         case 'skip-cache':
            data.pipe(res);
            break;
         default:
            res.redirect(data);
      }
   });
})
.post('/restaurants/update', utils.auth(), (req, res) => {
   worker.updateAllRestaurants().then(_ => res.json({message: 'ok'}));
});
