const express = require('express');
const models = require('../models');

const router = express.Router();

const auth = (req, res, next) => {
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
.get('/areas', (req, res) => {
   models.Area.findAll()
   .then(areas => res.json(areas));
})
.post('/areas', auth, (req, res) => {
   models.Area.create(cleanBody(req.body))
   .then(area => {
      res.json(area);
   });
})
.delete('/areas/:id', auth, (req, res) => {
   models.Area.findById(req.params.id)
   .then(area => area.destroy())
   .then(() => {
      res.json({message: 'deleted'});
   });
})
.put('/areas/:id', auth, (req, res) => {

})

.get('/restaurants', (req, res) => {
   models.Restaurant.findAll()
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
