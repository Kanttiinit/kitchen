const models = require('../models');
const aws = require('./aws');
const moment = require('moment');
const pug = require('pug');
const webshot = require('webshot');
const PassThrough = require('stream').PassThrough;

const template = pug.compileFile(__dirname + '/template.jade');

function generateImage(restaurantId, date) {
   const day = date || moment().format('YYYY-MM-DD');
   const filename = restaurantId + '_' + day + '.jpg';

   return aws.getUrl(filename)
   .catch(err => {
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
      .then(restaurant => {
         const courses = restaurant.Menus.length ? restaurant.Menus[0].courses || [] : [];
         const html = template({
            restaurant,
            courses,
            date: moment(day).format('ddd D.M.')
         });

         const stream = webshot(html, {
            siteType: 'html',
            streamType: 'jpeg',
            screenSize: {width: 400, height: 68 + courses.length * 26},
            quality: 90
         });
         const passthrough = new PassThrough();
         stream.pipe(passthrough);

         return aws.upload(passthrough, filename);
      });
   });
}

generateImage(1);

module.exports = generateImage;
