const models = require('../models');
const parse = require('./index');
const promiseChain = require('../utils/promiseChain');

const langs = ['fi', 'en'];

function createOrUpdateMenu(menu, restaurant) {
   return models.Menu.findOne({
      where: {
         day: menu.day,
         RestaurantId: restaurant.id
      }
   })
   .then(existing => {
      if (existing) {
         return existing.update({courses_i18n: menu.courses_i18n});
      }

      return models.Menu.create({
         day: menu.day,
         RestaurantId: restaurant.id,
         courses_i18n: menu.courses_i18n
      });
   });
}

function joinLangMenus(langMenus) {
   return langMenus[0].map(menu => {
      return {
         day: menu.day,
         courses_i18n: langs.reduce((carry, lang, j) => {
            carry[lang] = langMenus[j].find(m => m.day === menu.day).courses;
            return carry;
         }, {})
      };
   });
}

function updateRestaurantMenus(restaurant) {
   return Promise.all(
      langs.map(lang => parse(restaurant.menuUrl, lang))
   )
   .then(langMenus => {
      const menus = joinLangMenus(langMenus);
      console.log(`\tFound ${menus.length} days of menus.`);
      return Promise.all(
         menus.map(menu => createOrUpdateMenu(menu, restaurant))
      );
   });
}

function updateAllRestaurants() {
   return models.Restaurant.findAll()
   .then(restaurants => {
      console.log('Start processing ' + restaurants.length + ' restaurants.\n');
      return promiseChain(
         restaurants.map(restaurant => () => {
            console.log(`Processing ${restaurant.name_i18n.fi}:`);
            return updateRestaurantMenus(restaurant);
         })
      );
   });
}

if (!module.parent) {
   models.sequelize.sync()
   .then(() => updateAllRestaurants())
   .then(() => process.exit());
}

module.exports = {updateRestaurantMenus, updateAllRestaurants};
