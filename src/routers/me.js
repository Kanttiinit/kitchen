import express from 'express';
import models from '../models';
import _ from 'lodash';
import userLogin from '../utils/userLogin';
import {validate} from 'jsonschema';
import schema from '../../schema/preferences.json';

export default express.Router()
.post('/login', userLogin)
.use((req, res, next) => {
  if (req.session.user) {
    models.User.findOne({where: {email: req.session.user}})
    .then(user => {
      req.user = user;
      next();
    });
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
})
.get('/logout', (req, res) => {
  delete req.session.user;
  res.json({message: 'Logged out.'});
})
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
      .then(() => res.json({message: 'Preferences saved.'}));
    }
  } catch(e) {
    next({code: 400, message: 'Unknown preference.'});
  }
});
