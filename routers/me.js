const express = require('express');
const _ = require('lodash');
const parseUser = require('../utils/parseUser');

module.exports = express.Router()
.use(parseUser)
.use((req, res, next) => {
  if (!req.user) {
    next(true);
  } else {
    next();
  }
})
.get('/', (req, res) => {
  res.json(_.pick(req.user, ['email', 'displayName', 'preferences', 'photo']));
})
.put('/preferences', (req, res) => {
  const preferences = _.pick(req.body, ['useLocation', 'lang', 'selectedArea', 'filtersExpanded']);
  req.user.update({
    preferences: Object.assign({}, req.user.preferences, preferences)
  })
  .then(user => res.json(user.preferences));
})
.use((err, req, res, next) => res.status(401).json({message: 'Unauthorized.'}));
