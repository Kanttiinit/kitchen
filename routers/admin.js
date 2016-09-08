const express = require('express');
const worker = require('../parser/worker');
const parseUser = require('../utils/parseUser');
const models = require('../models');
const createModelRouter = require('../utils/createModelRouter');

module.exports = express.Router()
.use(express.static('admin'))
.use(parseUser)
.use((req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
})
.use(createModelRouter(models.Area))
.use(createModelRouter(models.Restaurant))
.use(createModelRouter(models.Favorite))
.post('/update-restaurants', (req, res) =>
  worker.updateAllRestaurants().then(() => res.json({message: 'ok'}))
);
