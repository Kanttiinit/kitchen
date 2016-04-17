const models = require('../models');
const moment = require('moment');
const Canvas = require('canvas');

const margin = 10;
const spacing = {
   huge: 16,
   big: 12,
   small: 8,
   tiny: 4
};
const fontSize = {
   title: 26,
   date: 16,
   course: 14
};

function generateImage(restaurantId, date) {
   return models.Restaurant.findOne({
      where: { id: restaurantId },
      include: [
         {
            model: models.Menu,
            required: false,
            where: { day: date || moment().format('YYYY-MM-DD') }
         }
      ]
   })
   .then(restaurant => {
      var menu = restaurant.Menus[0];
      if (!menu)
         menu = {courses: [{title: 'Ei ruokalistoja.', properties: []}]};

      const width = 500;
      const height = margin * 2 + fontSize.title + fontSize.date + spacing.small + (menu.courses.length + 1) * (fontSize.course + spacing.small);
      const canvas = new Canvas(width, height);
      const ctx = canvas.getContext('2d');

      var y = margin + fontSize.title - 3;

      ctx.fillStyle = '#eee';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#139180';
      ctx.fillRect(0, 0, width, fontSize.title + fontSize.date + spacing.small + margin * 2);
      ctx.font = fontSize.title + 'px Helvetica';
      ctx.fillStyle = '#fff';
      ctx.fillText(restaurant.name, margin, y);

      ctx.font = fontSize.date + 'px Helvetica';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      y += fontSize.date + spacing.small;
      ctx.fillText(moment(date).format('ddd D.M.YYYY'), margin, y);

      ctx.font = fontSize.course + 'px Helvetica';
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

      return canvas.toBuffer();
   });
}

module.exports = generateImage;
