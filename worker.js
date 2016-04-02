const models = require('./models');
const parser = require('./parser');
const schedule = require('node-schedule');

function updateMenu(restaurant) {
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
                  day: menu.day,
                  RestaurantId: restaurant.id,
                  courses: menu.courses
               })
            })
         )
      );
   });
}

function worker(restaurants, i) {
   i = i || 0;
   const restaurant = restaurants[i];

   if (restaurant) {
      console.log('Processing ' + (i + 1) + '/' + restaurants.length + ' ' + restaurant.name);
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
   models.sequelize.sync().then(() => {
      if (process.argv[2] === 'now')
         updateAllRestaurants().then(_ => process.exit());
      else
         schedule.scheduleJob('0 * * * * *', () => {
            updateAllRestaurants();
         });
   });
}

module.exports = {updateMenu, updateAllRestaurants};
