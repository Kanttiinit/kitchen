import * as express from 'express';
import * as worker from '../parser/worker';
import * as models from '../models';
import createModelRouter from '../utils/createModelRouter';
import * as bufferEq from 'buffer-equal-constant-time';
import * as crypto from 'crypto';

const verifyPassword = (req, res, next) => {
  if (!req.app.locals.adminPassword) {
    next({ code: 500, message: 'No admin password configured.' });
  } else {
    next();
  }
};

const authenticate = async (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    next({ code: 401, message: 'Unauthorized.' });
  }
};

const updateAreaMaps = async (req, res) => {
  const areas = await models.Area.findAll();
  for (const area of areas) {
    await area.fetchMapImageUrl();
    await area.save();
  }
  res.json({ message: 'Success.' });
};

const updateRestaurants = async (req, res) => {
  await worker.updateAllRestaurants();
  res.json({ message: 'ok' });
};

const login = (req, res) => {
  const requestPassword = new Buffer(
    crypto
      .createHash('sha256')
      .update(req.body.password)
      .digest('base64')
  );
  const password = new Buffer(
    crypto
      .createHash('sha256')
      .update(req.app.locals.adminPassword)
      .digest('base64')
  );
  if (req.session.admin) {
    res.json({ message: 'Already logged in.' });
  } else if (bufferEq(requestPassword, password)) {
    req.session.admin = true;
    res.json({ message: 'Logged in.' });
  } else {
    res.status(401).json({ message: 'Wrong password.' });
  }
};

const logout = (req, res) => {
  if (req.session.admin) {
    req.session.admin = false;
    res.json({ message: 'Logged out.' });
  } else {
    res.status(400).json({ message: 'Not logged in.' });
  }
};

const router = express.Router();

router
  .use(verifyPassword)
  .post('/login', login)
  .post('/logout', logout)
  .use(authenticate)
  .use(createModelRouter(models.Area))
  .use(createModelRouter(models.Restaurant))
  .use(createModelRouter(models.Favorite))
  .use(createModelRouter(models.Update))
  .use(createModelRouter(models.OpeningHour))
  .get('/logged-in', (req, res) => res.json({ message: 'Yes.' }))
  .get('/update-area-maps', updateAreaMaps)
  .post('/update-restaurants', updateRestaurants);

export default router;
