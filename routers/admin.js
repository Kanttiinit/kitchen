const express = require('express');
const worker = require('../parser/worker');
const parseUser = require('../utils/parseUser');

module.exports = express.Router()
.use(parseUser)
.use((req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    next(true);
  }
})
.use(express.static('admin'))
.post('/restaurants/update', (req, res) =>
  worker.updateAllRestaurants().then(() => res.json({message: 'ok'}))
);
