const models = require('./models');
const parser = require('./parser');
const schedule = require('node-schedule');

const updateMenu = restaurant => {
   return parser(restaurant.menuUrl)
   .then(menus => {
      console.log('\tFound ' + menus.length + ' days of menues.');
      return Promise.all(
         menus.map(menu =>
            models.Menu.findOne({
               where: {
                  date: menu.date,
                  RestaurantId: restaurant.id
               }
            })
            .then(existing => {
               if (existing)
                  return existing.update({courses: menu.courses});

               return models.Menu.create({
                  date: menu.date,
                  RestaurantId: restaurant.id,
                  courses: menu.courses
               })
            })
         )
      );
   });
};

const worker = (restaurants, i) => {
   const restaurant = restaurants[i];
   console.log('Processing ' + (i + 1) + '/' + restaurants.length + ' ' + restaurant.name);
   if (restaurant)
      updateMenu(restaurant).then(() => worker(restaurants, i + 1));
};

if (!module.parent) {
   models.sequelize.sync().then(() => {
      schedule.scheduleJob('0 0 * * * *', () => {
         models.Restaurant.findAll()
         .then(restaurants => {
            console.log('Start processing ' + restaurants.length + ' restaurants.\n');
            worker(restaurants, 0)
         })
      });
   });
}

module.exports = updateMenu;
