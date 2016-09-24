import express from 'express';
import _ from 'lodash';
import parseUser from '../utils/parseUser';
import jwt from 'jsonwebtoken';
import authenticate from '../utils/authenticate';
import {validate} from 'jsonschema';
import schema from '../../schema/preferences.json';

const jwtSecret = process.env.JWT_SECRET || 'secret';

export default express.Router()
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
