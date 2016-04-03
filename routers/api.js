const express = require('express');
const models = require('../models');
const worker = require('../worker');
const sequelize = require('sequelize');
const ua = require('universal-analytics');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const imageGenerator = require('../image-generator');

const visitor = ua(process.env.UA_ID);
const track = (action, label) => {
   visitor.event('API Call', action, label).send();
};

const router = express.Router();

const auth = (req, res, next) => {
   req.loggedIn = req.session.loggedIn;
   if (req.session.loggedIn)
      next();
   else
      res.status(403).json({message: 'unauhtorized'});
};

const bot = new TelegramBot(process.env.TG_BOT_TOKEN);

router
.post('/send-message', (req, res) => {
   bot.sendMessage(Number(process.env.TG_GROUP_ID), req.body.message)
   .then(_ => res.json({message: 'ok'}))
   .catch(_ => res.status(404).json({message: 'error'}));
})
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
.get('/areas', cors(), (req, res) => {
   track('/areas');
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

.get('/menus/:restaurantIds', cors(), (req, res) => {
   const ids = req.params.restaurantIds.split(',');
   track('/menus', req.params.restaurantIds);
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
               attributes: ['date', 'courses'],
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

.param('favoriteId', (req, res, next) => {
   models.Favorite.findById(req.params.favoriteId)
   .then(favorite => {
      if (favorite) {
         req.favorite = favorite;
         next();
      } else {
         res.status(404).json({message: 'no such favorite'});
      }
   });
})
.get('/favorites', (req, res) => {
   models.Favorite.findAll({attributes: ['id', 'name', 'regexp', 'icon']})
   .then(restaurants => res.json(restaurants));
})
.post('/favorites', auth, (req, res) => {
   models.Favorite.create(req.body)
   .then(favorite => res.json(favorite));
})
.delete('/favorites/:favoriteId', auth, (req, res) => {
   req.favorite.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/favorites/:favoriteId', auth, (req, res) => {
   req.favorite.update(req.body)
   .then(favorite => res.json(favorite));
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
   models.Restaurant.findAll({
      include: [{model: models.Area}],
      order: [['AreaId', 'ASC'], ['name', 'ASC']]
   })
   .then(restaurants => res.json(restaurants));
})
.get('/restaurants/:restaurantId/image/', (req, res) => {
   imageGenerator(req.params.restaurantId, req.query.day)
   .then(path => {
      res.sendFile(path);
   });
})
.post('/restaurants', auth, (req, res) => {
   req.body.openingHours = req.body.openingHours ? JSON.parse(req.body.openingHours) : [];
   models.Restaurant.create(req.body)
   .then(restaurant => {
      if (restaurant.menuUrl)
         worker.updateMenu(restaurant);
      res.json(restaurant);
   });
})
.post('/restaurants/update', auth, (req, res) => {
   worker.updateAllRestaurants()
   .then(_ => res.json({message: 'ok'}))
   .catch(e => console.error(e));
})
.delete('/restaurants/:restaurantId', auth, (req, res) => {
   req.restaurant.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/restaurants/:restaurantId', auth, (req, res) => {
   req.body.openingHours = JSON.parse(req.body.openingHours);
   req.restaurant.update(req.body)
   .then(restaurant => {
      if (restaurant.menuUrl)
         worker.updateMenu(restaurant);
      res.json(restaurant);
   });
});

module.exports = router;
