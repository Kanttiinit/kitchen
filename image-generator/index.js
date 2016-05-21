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

function renderHtml(restaurantId, date, width) {
   if (width)
      width = Math.min(Math.max(400, width), 1000);
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
         width,
         date: moment(date).format('dddd D.M.'),
         openingHours: restaurant.getPrettyOpeningHours()[moment(date).format('ddd').toLowerCase().substring(0, 2)]
      });
   });
}

function getImageStream(html) {
   const stream = webshot(html, {
      siteType: 'html',
      streamType: 'png',
      shotSize: {width: 'all', height: 'all'},
      windowSize: {width: 'all', height: 'all'},
   });

   const passthrough = new PassThrough();
   stream.pipe(passthrough);

   return passthrough;
}

function generateImage(options) {
   const {restaurantId, date, mode, width} = options;

   const day = date || moment().format('YYYY-MM-DD');
   const filename = restaurantId + '_' + day + '.png';

   if (mode !== 'html' && mode !== 'skip-cache')
      return aws.getUrl(filename)
      .then(url => {
         if (!url)
            return renderHtml(restaurantId, date, width)
            .then(html => getImageStream(html))
            .then(imageStream => aws.upload(imageStream, filename));

         return url;
      });

   return renderHtml(restaurantId, date, width)
   .then(html => {
      if (mode === 'html')
         return html;

      return getImageStream(html);
   });
}

module.exports = generateImage;
