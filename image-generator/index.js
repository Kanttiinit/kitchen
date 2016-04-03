const webshot = require('webshot');
const jade = require('jade');
const models = require('../models');
const moment = require('moment');
const fs = require('fs');

const imageTemplate = jade.compileFile(__dirname + '/restaurant-image.jade');

function getImage(restaurantId, date) {
   date = moment(date).format('YYYY-MM-DD');
   const filename = __dirname + '/images/' + date + '_' + restaurantId + '.jpg';

   return new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
         if (err)
            generateImage(restaurantId, date, filename)
            .then(_ => resolve(filename))
            .catch(e => reject(e));
         else
            return resolve(filename);
      });
   });
}

function generateImage(restaurantId, date, filename) {
   return models.Menu.findOne({
      where: {
         RestaurantId: restaurantId,
         day: date
      },
      include: [
         {model: models.Restaurant}
      ]
   })
   .then(menu => new Promise((resolve, reject) => {
      webshot(
         imageTemplate({
            courses: menu.courses,
            restaurant: menu.Restaurant,
            date: moment(menu.date).format('DD.MM.YYYY')
         }),
         filename,
         {
            siteType: 'html',
            screenSize: {width: 500, height: 300}
         },
         function(err) {
            if (err)
               reject(err);
            else
               resolve();
         }
      );
   }));
}

module.exports = getImage;
