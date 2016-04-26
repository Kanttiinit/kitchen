const models = require('../models');
const aws = require('./aws');
const moment = require('moment');
const pug = require('pug');
const webshot = require('webshot');
const PassThrough = require('stream').PassThrough;

const template = pug.compileFile(__dirname + '/template.jade');

function renderImage(restaurantId, date) {
   return models.Restaurant.findOne({
      where: { id: restaurantId },
      include: [
         {
            model: models.Menu,
            required: false,
            where: { day: moment(date).format('YYYY-MM-DD') }
         }
      ]
   })
   .then(restaurant => {
      const courses = restaurant.Menus.length ? restaurant.Menus[0].courses || [] : [];
      const html = template({
         restaurant,
         courses,
         date: moment(date).format('ddd D.M.')
      });

      const stream = webshot(html, {
         siteType: 'html',
         streamType: 'jpeg',
         screenSize: {width: 400},
         shotSize: {width: 'all', height: 'window'},
         quality: 90
      });

      const passthrough = new PassThrough();
      stream.pipe(passthrough);

      return passthrough;
   });
}

function generateImage(skipCache, restaurantId, date) {
   const day = date || moment().format('YYYY-MM-DD');
   const filename = restaurantId + '_' + day + '.jpg';

   if (skipCache) {
      return renderImage(restaurantId, date);
   } else {
      return aws.getUrl(filename)
      .catch(err => {
         return renderImage(restaurantId, date)
         .then(image => aws.upload(image, filename));
      });
   }
}

module.exports = generateImage;
