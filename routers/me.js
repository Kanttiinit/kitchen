const express = require('express');
const _ = require('lodash');
const parseUser = require('../utils/parseUser');
const jwt = require('jsonwebtoken');
const authenticate = require('../utils/authenticate');

const jwtSecret = process.env.JWT_SECRET || 'secret';

module.exports = express.Router()
.get('/login', parseUser, (req, res) => {
  res.json({token: jwt.sign(req.user.email, jwtSecret)});
})
.use(authenticate)
.get('/', (req, res) => {
  res.json(_.pick(req.user, ['email', 'displayName', 'preferences', 'photo', 'admin']));
})
.put('/preferences', (req, res) => {
  const preferences = _.pick(req.body, ['useLocation', 'lang', 'selectedArea', 'filtersExpanded']);
  req.user.update({
    preferences: Object.assign({}, req.user.preferences, preferences)
  })
  .then(user => res.json(user.preferences));
});
