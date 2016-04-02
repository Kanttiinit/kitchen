const webshot = require('webshot');
const jade = require('jade');
const models = require('../models');
const moment = require('moment');
const fs = require('fs');

const imageTemplate = jade.compileFile(__dirname + '/restaurant-image.jade');

function getImage(restaurantId, date) {
   const filename = __dirname + '/images/' + date + restaurantId + '.jpg';

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
         RestaurantId: restaurantId
      },
      include: [
         {model: models.Restaurant}
      ]
   })
   .then(menu => {
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
               throw new Error(err);
         }
      );
   });
}

module.exports = getImage;
