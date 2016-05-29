const express = require('express');
const models = require('../models');
const worker = require('../parser/worker');
const sequelize = require('sequelize');
const cors = require('cors');
const {getImageStream, renderHtml} = require('../image-generator');
const utils = require('../utils');
const ua = require('universal-analytics');
const moment = require('moment');
const aws = require('../utils/aws');

const visitor = ua(process.env.UA_ID);

const router = express.Router();

router.use((req, res, next) => {
   if (req.method === 'GET' && process.env.NODE_ENV === 'production') {
      let fn = console.log;
      if (!req.loggedIn)
         fn = (...args) => visitor.event(...args).send();

      fn('API Call', req.originalUrl, req.get('User-Agent'));
   }
   next();
});

utils.createRestApi({router, model: models.Favorite});

utils.createRestApi({
   router,
   model: models.Area,
   getListQuery(req) {
      return {
         include: [{model: models.Restaurant}]
      };
   }
});

utils.createRestApi({
   router,
   model: models.Restaurant,
   getListQuery(req) {
      if (req.query.location) {
         const [latitude, longitude] = req.query.location.split(',');
         return {
            query: `SELECT *,
               (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance
               FROM restaurants ORDER BY distance;`,
            replacements: {latitude, longitude}
         };
      } else {
         return {
            include: req.loggedIn ? [{model: models.Area}] : [],
            order: [['AreaId', 'ASC'], ['name', 'ASC']]
         };
      }
   }
})

module.exports = router
.get('/menus/:restaurantIds', cors(), (req, res) => {
   const ids = req.params.restaurantIds.split(',');
   utils.track('/menus', req.params.restaurantIds);
   if (ids.every(n => !isNaN(n))) {
      models.Restaurant.findAll({
         where: {
            id: {$in: ids.map(n => +n)}
         },
         include: [
            {
               required: false,
               model: models.Menu,
               where: {
                  date: {$gte: sequelize.fn('date_trunc', 'day', sequelize.fn('now'))}
               }
            }
         ],
         order: sequelize.col('date')
      })
      .then(restaurants => {
         res.json(restaurants.map(r => r.getPublicAttributes()));
      });
   } else {
      res.status(400).json({message: 'invalid list of restaurant ids'});
   }
})
.get('/restaurants/:restaurantId/menu(.:ext)?', (req, res) => {
   const {restaurantId, ext} = req.params;
   const {width} = req.query;

   const day = moment(req.query.day).format('YYYY-MM-DD');
   const filename = restaurantId + '_' + day + '.png';

   models.Restaurant.findOne({
      where: { id: restaurantId },
      include: [
         {
            model: models.Menu,
            required: false,
            where: { day }
         }
      ]
   })
   .then(restaurant => {
      if (!restaurant) {
         res.status(404).json({message: 'not found'});
         return;
      }

      if (!ext) {
         res.json(restaurant.getPublicAttributes());
      } else if (ext === 'png') {
         return aws.getUrl(filename)
         .then(url => {
            if (!url)
            return getImageStream(renderHtml(restaurant, day, width))
            .then(imageStream => aws.upload(imageStream, filename));

            return url;
         })
         .then(url => res.redirect(url));
      } else {
         const html = renderHtml(restaurant, day, width)

         if (ext === 'html')
            return res.send(html);

         return getImageStream(html).pipe(res);
      }
   });
})
.post('/restaurants/update', utils.auth, (req, res) => {
   worker.updateAllRestaurants().then(_ => res.json({message: 'ok'}));
});
