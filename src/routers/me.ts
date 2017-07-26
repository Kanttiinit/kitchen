import * as express from 'express';
import {pick} from 'lodash';
import userLogin from '../utils/userLogin';
import {validate} from 'jsonschema';
import auth from '../utils/auth';
const schema = require('../../schema/preferences.json');

export const logOut = (req, res) => {
  delete req.session.user;
  res.json({message: 'Logged out.'});
};

export const getUser = (req, res) => {
  res.json(pick(req.user, ['email', 'displayName', 'preferences', 'photo', 'admin']));
};

export const savePreferences = async (req, res, next) => {
  try {
    const preferences = req.body;
    const validationResult = validate(preferences, schema);
    if (validationResult.errors.length) {
      next({code: 400, message: validationResult.errors[0]});
    } else {
      await req.user.update({
        preferences: Object.assign({}, req.user.preferences, preferences)
      });
      res.json({message: 'Preferences saved.'});
    }
  } catch(e) {
    next({code: 400, message: 'Unknown preference.'});
  }
};

export default express.Router()
.post('/login', userLogin)
.use(auth)
.get('/', getUser)
.get('/logout', logOut)
.put('/preferences', savePreferences);
