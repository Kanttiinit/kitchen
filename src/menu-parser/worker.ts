import * as dotenv from 'dotenv';
dotenv.config();
import * as models from '../models';
import parse from './index';
import { createLogger } from '../utils/log';

const langs = ['fi', 'en'];

const log = createLogger('menu-parser');

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
}

export async function updateAllRestaurants() {
  log(`Starting to update menus...`);
  const restaurants = await models.Restaurant.findAll();
  const start = Date.now();
  let updatedRestaurants = 0;
  for (const restaurant of restaurants) {
    try {
      await updateRestaurantMenus(restaurant);
      updatedRestaurants++;
    } catch (e) {
      log(
        `menu update failed for restaurant ${restaurant.name_i18n.fi}: ${e.message}`,
        true
      );
    }
  }
  log(
    `${updatedRestaurants} / ${restaurants.length} menus updated in ${(
      (Date.now() - start) /
      1000
    ).toFixed(2)}s`
  );
}

if (!module.parent) {
  (async () => {
    await updateAllRestaurants();
    process.exit();
  })();
}
