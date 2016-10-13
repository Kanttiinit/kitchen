import express from 'express';
import _ from 'lodash';
import userLogin from '../utils/userLogin';
import {validate} from 'jsonschema';
import schema from '../../schema/preferences.json';
import auth from '../utils/auth';

export default express.Router()
.post('/login', userLogin)
.use(auth)
.get('/logout', (req, res) => {
  delete req.session.user;
  res.json({message: 'Logged out.'});
})
.get('/', (req, res) => {
  res.json(_.pick(req.user, ['email', 'displayName', 'preferences', 'photo', 'admin']));
})
.put('/preferences', async (req, res, next) => {
  try {
    const preferences = req.body;
    const validationResult = validate(preferences, schema);
    if (validationResult.errors.length) {
      next({code: 400, message: validationResult.errors[0].stack});
    } else {
      await req.user.update({
        preferences: Object.assign({}, req.user.preferences, preferences)
      });
      res.json({message: 'Preferences saved.'});
    }
  } catch(e) {
    next({code: 400, message: 'Unknown preference.'});
  }
});
