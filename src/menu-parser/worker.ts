import * as models from '../models';
import parse from './index';
import { log } from '../utils/log';

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
  for (const menu of menus) {
    await createOrUpdateMenu(menu, restaurant);
  }
  log('Menu parser', 'menu updated', restaurant.name, menus.length);
}

export async function updateAllRestaurants() {
  const restaurants = await models.Restaurant.findAll();
  const start = Date.now();
  for (const restaurant of restaurants) {
    try {
      await updateRestaurantMenus(restaurant);
    } catch (e) {
      log('Menu parser', 'menu update failed', restaurant.name, e.message);
    }
  }
  log('Menu parser', 'all menus updated', 'time', Date.now() - start);
}

if (!module.parent) {
  (async () => {
    await updateAllRestaurants();
    process.exit();
  })();
}
