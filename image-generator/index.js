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

function findMenu(restaurantId, day) {
   return models.Restaurant.findOne({
      where: { id: restaurantId },
      include: [
         {
            model: models.Menu,
            required: false,
            where: { day }
         }
      ]
   })
};

function renderHtml(restaurant, day, width) {
   if (width)
      width = Math.min(Math.max(400, width), 1000);

   const courses = restaurant.Menus.length ? restaurant.Menus[0].courses || [] : [];
   return template({
      restaurant,
      courses,
      getColor,
      width,
      date: moment(day).format('dddd D.M.'),
      openingHours: restaurant.getPrettyOpeningHours()[moment(day).format('dd').toLowerCase()]
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

function generateImage(req, res) {
   const {restaurantId, ext} = req.params;
   const {width} = req.query;

   const day = moment(req.query.day).format('YYYY-MM-DD');
   const filename = restaurantId + '_' + day + '.png';

   return findMenu(restaurantId, day)
   .then(restaurant => {

      if (!restaurant) {
         res.status(404).json({message: 'not found'});
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
}

module.exports = generateImage;
