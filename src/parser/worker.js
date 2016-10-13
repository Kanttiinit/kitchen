import models from '../models';
import parse from './index';
import promiseChain from '../utils/promiseChain';

const langs = ['fi', 'en'];

async function createOrUpdateMenu(menu, restaurant) {
  const existingMenu = await models.Menu.findOne({
    where: {
      day: menu.day,
      RestaurantId: restaurant.id
    }
  });

  if (existingMenu) {
    return existingMenu.update({courses_i18n: menu.courses_i18n});
  }

  return models.Menu.create({
    day: menu.day,
    RestaurantId: restaurant.id,
    courses_i18n: menu.courses_i18n
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

export async function updateRestaurantMenus(restaurant) {
  const langMenus = await Promise.all(
    langs.map(lang => parse(restaurant.menuUrl, lang))
  );
  const menus = joinLangMenus(langMenus);
  console.log(`\tFound ${menus.length} days of menus.`);
  return Promise.all(
    menus.map(menu => createOrUpdateMenu(menu, restaurant))
  );
}

export async function updateAllRestaurants() {
  const restaurants = await models.Restaurant.findAll();
  console.log('Start processing ' + restaurants.length + ' restaurants.\n');
  return promiseChain(
    restaurants.map(restaurant => () => {
      console.log(`Processing ${restaurant.name_i18n.fi}:`);
      return updateRestaurantMenus(restaurant);
    })
  );
}

if (!module.parent) {
  models.sequelize.sync()
  .then(() => updateAllRestaurants())
  .then(() => process.exit());
}
