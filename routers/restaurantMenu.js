const express = require('express');
const moment = require('moment');

const models = require('../models');
const aws = require('../utils/aws');
const {getImageStream, renderHtml} = require('../image-generator');

module.exports = express.Router()
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
         res.json(restaurant.getPublicAttributes(req.lang));
      } else if (ext === 'png') {
         return aws.getUrl(filename)
         .then(url => {
            if (!url) {
               const imageStream = getImageStream(renderHtml(restaurant, day, width));
               return aws.upload(imageStream, filename);
            }
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
