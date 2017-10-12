import * as express from 'express';
import * as worker from '../parser/worker';
import * as models from '../models';
import createModelRouter from '../utils/createModelRouter';
import auth from '../utils/auth';
import * as bufferEq from 'buffer-equal-constant-time';
import * as crypto from 'crypto';

const adminPassword = process.env.ADMIN_PASSWORD;

export const verifyAdmin = (req, res, next) => {
  if ((req.user && req.user.admin) || req.session.admin) {
    next();
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
};

export const updateAreaMaps = async (req, res) => {
  const areas = await models.Area.findAll();
  for (const area of areas) {
    await area.fetchMapImageUrl();
    await area.save();
  }
  res.json({message: 'Success.'});
};

export const updateRestaurants = async (req, res) => {
  await worker.updateAllRestaurants();
  res.json({message: 'ok'});
};

export const login = (req, res) => {
  const requestPassword = new Buffer(crypto.createHash('sha256').update(req.body.password).digest('base64'));
  const password = new Buffer(crypto.createHash('sha256').update(adminPassword).digest('base64'));
  if (req.session.admin) {
    res.json({message: 'Already logged in.'});
  } else if (bufferEq(requestPassword, password)) {
    req.session.admin = true;
    res.json({message: 'Logged in.'});
  } else {
    res.status(401).json({message: 'Wrong password.'});
  }
};

export const logout = (req, res) => {
  if (req.session.admin) {
    req.session.admin = false;
    res.json({message: 'Logged out.'});
  } else {
    res.status(400).json({message: 'Not logged in.'});
  }
};

const router = express.Router();

if (adminPassword) {
  router
    .post('/login', login)
    .post('/logout', logout);
}

router
.use(auth)
.use(verifyAdmin)
.use(createModelRouter(models.Area))
.use(createModelRouter(models.Restaurant))
.use(createModelRouter(models.Favorite))
.use(createModelRouter(models.Update))
.get('/update-area-maps', updateAreaMaps)
.post('/update-restaurants', updateRestaurants);

export default router;
