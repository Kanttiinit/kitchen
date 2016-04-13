const models = require('../models');
const moment = require('moment');
const fs = require('fs');
const Canvas = require('canvas');

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
      const margin = 10;
      const spacing = {
         huge: 16,
         big: 12,
         small: 8,
         tiny: 4
      };
      const fontSize = {
         title: 30,
         date: 14,
         course: 13
      };

      const height = margin * 2 + fontSize.title + fontSize.date + spacing.small + (menu.courses.length + 1) * (fontSize.course + spacing.small);
      const canvas = new Canvas(500, height);
      const ctx = canvas.getContext('2d');

      var y = margin + fontSize.title - 3;

      ctx.fillStyle = '#eee';
      ctx.fillRect(0, 0, 500, height);

      ctx.fillStyle = '#139180';
      ctx.fillRect(0, 0, 500, fontSize.title + fontSize.date + spacing.small + margin * 2);
      ctx.font = fontSize.title + 'px Helvetica';
      ctx.fillStyle = '#fff';
      ctx.fillText(menu.Restaurant.name, margin, y);

      ctx.font = fontSize.date + 'px Helvetica';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      y += fontSize.date + spacing.small;
      ctx.fillText(moment(menu.date).format('D.M.YYYY'), margin, y);

      ctx.font = '12px Helvetica';
      y += fontSize.course + spacing.big + margin;
      menu.courses.forEach(course => {
         ctx.fillStyle = '#000';
         ctx.fillText('• ' + course.title, margin, y);
         var x = ctx.measureText('• ' + course.title).width + spacing.huge;
         ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
         course.properties.forEach(property => {
            ctx.fillText(property, x, y);
            x += ctx.measureText(property).width + spacing.tiny;
         });
         y += fontSize.course + spacing.small;
      });

      fs.writeFile(filename, canvas.toBuffer(), err => {
         if (err)
            reject(err);
         else
            resolve(filename);
      });
   }));
}

module.exports = getImage;
