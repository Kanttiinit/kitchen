import parse, { MenuItem } from './index.ts';
import { db, Menu } from '../db.ts';
import { Restaurant, restaurants } from '../../data/data.ts';

const langs: ('fi' | 'en')[] = ['fi', 'en'];

async function createOrUpdateMenu(menu: {
  day: string;
  courses_i18n: Menu['courses_i18n'];
}, restaurant: Restaurant) {
  await db
    .insertInto('menus')
    .values({
      restaurant_id: restaurant.id,
      day: menu.day,
      courses_i18n: JSON.stringify(menu.courses_i18n),
    })
    .onConflict((oc) =>
      oc
        .columns(['restaurant_id', 'day'])
        .doUpdateSet({ courses_i18n: JSON.stringify(menu.courses_i18n) })
    )
    .execute();
}

function joinLangMenus(langMenus: MenuItem[][]) {
  return langMenus[0].map((menu) => {
    return {
      day: menu.day,
      courses_i18n: langs.reduce((carry, lang, j) => {
        const langMenu = langMenus[j].find((m) => m.day === menu.day);
        if (langMenu) {
          carry[lang] = langMenu.courses;
        }
        return carry;
      }, {} as Record<'fi' | 'en', MenuItem['courses']>),
    };
  });
}

export async function updateRestaurantMenus(restaurant: Restaurant) {
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
  console.log(`Starting to update menus...`);
  const start = Date.now();
  let updatedRestaurants = 0;
  for (const restaurant of restaurants) {
    try {
      await updateRestaurantMenus(restaurant);
      updatedRestaurants++;
    } catch (e: unknown) {
      console.log(
        `menu update failed for restaurant ${restaurant.name_i18n.fi}: ${
          e instanceof Error ? e.message : 'unknown error'
        }`,
      );
    }
  }
  console.log(
    `${updatedRestaurants} / ${restaurants.length} menus updated in ${
      (
        (Date.now() - start) /
        1000
      ).toFixed(2)
    }s`,
  );
}

if (import.meta.main) {
  await updateAllRestaurants();
  process.exit();
}
