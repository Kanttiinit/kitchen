const express = require('express');
const models = require('../models');

const router = express.Router();

const auth = (req, res, next) => {
   req.loggedIn = req.session.loggedIn;
   if (req.session.loggedIn)
      next();
   else
      res.status(403).json({message: 'unauhtorized'});
};

const cleanBody = body => {
   var cleaned = {};
   for (var key in body) {
      if (body[key])
         cleaned[key] = isNaN(body[key]) ? body[key] : Number(body[key]);
   }
   return cleaned;
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
   models.Area.create(cleanBody(req.body))
   .then(area => {
      res.json(area);
   });
})
.delete('/areas/:areaId', auth, (req, res) => {
   req.area.destroy().then(() => res.json({message: 'deleted'}));
})
.put('/areas/:areaId', auth, (req, res) => {

})
.get('/areas/:areaId/menus', (req, res) => {
   req.area.getRestaurants({
      attributes: ['id', 'name', 'image', 'url', 'latitude', 'longitude', 'openingHours'],
      include: [
         { model: models.Menu }
      ]
   })
   .then(restaurants => res.json(restaurants));
})

.get('/restaurants', auth, (req, res) => {
   models.Restaurant.findAll({include: [{model: models.Area}]})
   .then(restaurants => res.json(restaurants));
})
.post('/restaurants', auth, (req, res) => {
   models.Restaurant.create(cleanBody(req.body))
   .then(restaurant => {
      res.json(restaurant);
   });
})
.delete('/restaurants/:id', auth, (req, res) => {
   models.Restaurant.findById(req.params.id)
   .then(restaurant => restaurant.destroy())
   .then(() => {
      res.json({message: 'deleted'});
   });
})
.put('/restaurants/:id', auth, (req, res) => {

});

module.exports = router;
