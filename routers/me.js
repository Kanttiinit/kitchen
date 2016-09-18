const express = require('express');
const _ = require('lodash');
const parseUser = require('../utils/parseUser');
const jwt = require('jsonwebtoken');
const authenticate = require('../utils/authenticate');
const {validate} = require('jsonschema');
const schema = require('../schema/preferences.json');

const jwtSecret = process.env.JWT_SECRET || 'secret';

module.exports = express.Router()
.get('/login', parseUser, (req, res) => {
  res.json({token: jwt.sign(req.user.email, jwtSecret)});
})
.use(authenticate)
.get('/', (req, res) => {
  res.json(_.pick(req.user, ['email', 'displayName', 'preferences', 'photo', 'admin']));
})
.put('/preferences', (req, res, next) => {
  try {
    const preferences = req.body;
    const validationResult = validate(preferences, schema);
    if (validationResult.errors.length) {
      next({code: 400, message: validationResult.errors[0].stack});
    } else {
      req.user.update({
        preferences: Object.assign({}, req.user.preferences, preferences)
      })
      .then(user => res.json(user.preferences));
    }
  } catch(e) {
    next({code: 400, message: 'unknown preference'});
  }
});
