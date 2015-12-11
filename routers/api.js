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

.get('/restaurant', (req, res) => {

})
.post('/restaurant', auth, (req, res) => {

})
.delete('/restaurant/:id', auth, (req, res) => {

})
.put('/restaurant/:id', auth, (req, res) => {

});

module.exports = router;
