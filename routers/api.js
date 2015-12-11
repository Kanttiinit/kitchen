const express = require('express');
const models = require('../models');

const router = express.Router();

const auth = (req, res, next) => {
   if (req.session.loggedIn)
      next();
   else
      res.status(403).json({message: 'unauhtorized'});
};

router
.get('/areas', (req, res) => {

})
.post('/areas', auth, (req, res) => {

})
.delete('/areas/:id', auth, (req, res) => {

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
