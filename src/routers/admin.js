import express from 'express';
import worker from '../parser/worker';
import models from '../models';
import createModelRouter from '../utils/createModelRouter';
import auth from '../utils/auth';

export const verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next();
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
};

export const updateAreaMaps = async (req, res) => {
  const areas = await models.Area.findAll();
  await Promise.all(areas.map(async area => {
    await area.fetchMapImageUrl();
    return area.save();
  }));
  res.json({message: 'Success.'});
};

export const updateRestaurants = (req, res) =>
  worker.updateAllRestaurants().then(() => res.json({message: 'ok'}));

export default express.Router()
.use(auth)
.use(verifyAdmin)
.use(createModelRouter(models.Area))
.use(createModelRouter(models.Restaurant))
.use(createModelRouter(models.Favorite))
.get('/update-area-maps', updateAreaMaps)
.post('/update-restaurants', updateRestaurants);
