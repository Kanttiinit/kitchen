const models = require('../models');
const aws = require('./aws');
const moment = require('moment');
const pug = require('pug');
const webshot = require('webshot');
const PassThrough = require('stream').PassThrough;
const momentFI = require('moment/locale/fi');

moment.locale('fi');

const template = pug.compileFile(__dirname + '/template.jade');

function getColor(property) {
   const colors = {
      'L': '#795548',
      'G': '#FF5722',
      'V': '#4CAF50',
      'M': '#E91E63',
      'VL': '#3F51B5',
      'A': '#607D8B',
      'K': '#168b33',
      'VE': '#4CAF50'
   };

   if (property in colors)
      return colors[property];
   else
      return '#999';
}

function renderHtml(restaurantId, date) {
   return models.Restaurant.findOne({
      where: { id: restaurantId },
      include: [
         {
            model: models.Menu,
            required: false,
            where: { day: moment(date).format('YYYY-MM-DD') }
         }
      ]
   }).then(restaurant => {
      const courses = restaurant.Menus.length ? restaurant.Menus[0].courses || [] : [];
      return template({
         restaurant,
         courses,
         getColor,
         date: moment(date).format('dddd D.M.'),
         openingHours: restaurant.getPrettyOpeningHours()[moment(date).format('ddd').toLowerCase().substring(0, 2)]
      });
   });
}

function renderImage(restaurantId, date) {
   return renderHtml(restaurantId, date)
   .then(html => {
      const stream = webshot(html, {
         siteType: 'html',
         streamType: 'png',
         screenSize: {width: 400}
      });

      const passthrough = new PassThrough();
      stream.pipe(passthrough);

      return passthrough;
   });
}

function generateImage(restaurantId, date, mode) {
   const day = date || moment().format('YYYY-MM-DD');
   const filename = restaurantId + '_' + day + '.png';

   switch (mode) {
      case 'html':
         return renderHtml(restaurantId, date);
      case 'skip-cache':
         return renderImage(restaurantId, date);
      default:
      return aws.getUrl(filename)
      .catch(err => {
         return renderImage(restaurantId, date)
         .then(image => aws.upload(image, filename));
      });
   }
}

module.exports = generateImage;
