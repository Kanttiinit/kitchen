const models = require('../models');
const parse = require('../parser');

function updateMenu(restaurant) {
   return parse(restaurant.menuUrl)
   .then(menus => {
      console.log('\tFound ' + menus.length + ' days of menues.');
      return Promise.all(
         menus.map(menu =>
            models.Menu.findOne({
               where: {
                  day: menu.day,
                  RestaurantId: restaurant.id
               }
            })
            .then(existing => {
               if (existing)
                  return existing.update({courses_i18n: menu.courses});

               return models.Menu.create({
                  day: menu.day,
                  RestaurantId: restaurant.id,
                  courses_i18n: menu.courses
               });
            })
         )
      );
   });
}

function worker(restaurants, i) {
   i = i || 0;
   const restaurant = restaurants[i];

   if (restaurant) {
      console.log('Processing ' + (i + 1) + '/' + restaurants.length + ' ' + restaurant.name_i18n.fi);
      return updateMenu(restaurant).then(() => worker(restaurants, i + 1));
   }

   return Promise.resolve();
}

function updateAllRestaurants() {
   return models.Restaurant.findAll()
   .then(restaurants => {
      console.log('Start processing ' + restaurants.length + ' restaurants.\n');
      return worker(restaurants);
   });
}

if (!module.parent) {
   models.sequelize.sync()
   .then(() => updateAllRestaurants())
   .then(() => process.exit());
}

module.exports = {updateMenu, updateAllRestaurants};
