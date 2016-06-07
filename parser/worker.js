const models = require('../models');
const parse = require('./index');

const langs = ['fi', 'en'];

function updateMenu(restaurant) {
   return Promise.all(
      langs.map(lang => parse(restaurant.menuUrl, lang))
   )
   .then(langMenus => {
      return langs.reduce((carry, lang, i) => {
         carry[lang] = langMenus[i];
         return carry;
      }, {})
   })
   .then(a => console.log(a));
   // .then(menus => {
   //    console.log('\tFound ' + menus.length + ' days of menues.');
   //    return Promise.all(
   //       menus.map(menu =>
   //          models.Menu.findOne({
   //             where: {
   //                day: menu.day,
   //                RestaurantId: restaurant.id
   //             }
   //          })
   //          .then(existing => {
   //             if (existing) {
   //                return existing.update({
   //                   courses_i18n: {
   //                      ...existing.courses_i18n,
   //                      [lang]: menu.courses
   //                   }
   //                });
   //             }
   //
   //             return models.Menu.create({
   //                day: menu.day,
   //                RestaurantId: restaurant.id,
   //                courses_i18n: {
   //                   [lang]: menu.courses
   //                }
   //             });
   //          })
   //       )
   //    );
   // });
}

function updateAllRestaurants() {
   let promiseChain = Promise.resolve();
   return models.Restaurant.findAll()
   .then(restaurants => {
      console.log('Start processing ' + restaurants.length + ' restaurants.\n');
      restaurants.forEach(restaurant => {
         promiseChain = promiseChain.then(() => {
            console.log(`Processing ${restaurant.name_i18n.fi}:`);
            return updateMenu(restaurant);
         });
      });
      return promiseChain;
   });
}

if (!module.parent) {
   models.sequelize.sync()
   .then(() => updateAllRestaurants())
   .then(() => process.exit());
}

module.exports = {updateMenu, updateAllRestaurants};
