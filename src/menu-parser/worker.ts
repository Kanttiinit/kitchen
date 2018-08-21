import * as models from '../models';
import parse from './index';

const langs = ['fi', 'en'];

async function createOrUpdateMenu(menu, restaurant) {
  const existingMenu = await models.Menu.findOne({
    where: {
      day: menu.day,
      RestaurantId: restaurant.id
    }
  });

  if (existingMenu) {
    return existingMenu.update({ courses_i18n: menu.courses_i18n });
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
        const langMenu = langMenus[j].find(m => m.day === menu.day);
        if (langMenu) {
          carry[lang] = langMenu.courses;
        }
        return carry;
      }, {})
    };
  });
}

export async function updateRestaurantMenus(restaurant) {
  const langMenus = [];
  for (const lang of langs) {
    langMenus.push(await parse(restaurant.menuUrl, lang));
  }
  const menus = joinLangMenus(langMenus);
  console.log(`\tFound ${menus.length} days of menus.`);
  for (const menu of menus) {
    await createOrUpdateMenu(menu, restaurant);
  }
}

export async function updateAllRestaurants() {
  const restaurants = await models.Restaurant.findAll();
  console.log('Start processing ' + restaurants.length + ' restaurants.\n');
  for (const restaurant of restaurants) {
    try {
      console.log(`Processing ${restaurant.name_i18n.fi}:`);
      await updateRestaurantMenus(restaurant);
    } catch (e) {
      console.log(`Failed processing ${restaurant.name_i18n.fi}.`, e);
    }
  }
}

if (!module.parent) {
  (async () => {
    await updateAllRestaurants();
    process.exit();
  })();
}
