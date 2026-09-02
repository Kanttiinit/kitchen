import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

import { getRestaurantsForQuery } from './getRestaurants.ts';
import { areasWithRestaurants, favorites, restaurants } from './data.ts';
import { db } from '../../db.ts';
import moment from 'moment';
// import changeRouter from './changeRouter';
// import getRestaurantMenus from './getRestaurantMenus';

function formatIds(idString: string) {
  return (
    idString
      ? idString
        .split(',')
        .map((id) => +id)
        .filter((id) => !isNaN(id))
      : null
  );
}

function replacei18nFields(obj: any, lang: 'fi' | 'en') {
  const output: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (key.endsWith('_i18n')) {
      const normalizedKey = key.replace('_i18n', '');
      output[normalizedKey] = lang in value ? value[lang] : value[Object.keys(value)[0]];
    } else {
      output[key] = value;
    }
  }
  return output;
}

export const parseLanguage = createMiddleware<{ Variables: { lang: 'fi' | 'en' } }>(async (c, next) => {
  const lang = c.req.query('lang') ?? 'fi';
  if (lang === 'fi' || lang === 'en') {
    c.set('lang', lang);
  } else {
    c.set('lang', 'fi');
  }
  await next();
});

export default new Hono()
  .use(parseLanguage)
  .get('/menus', async (c) => {
    const restaurantIds = formatIds(c.req.query('restaurants') ?? '');
    const areaIds = formatIds(c.req.query('areas') ?? '');
    const days = (c.req.query('days') ?? '')
      .split(',')
      .map((day) => moment(day))
      .filter((m) => m.isValid());

    const allRestaurantIds = restaurants.filter((r) => restaurantIds?.includes(r.id) || areaIds?.includes(r.areaId))
      .map((r) => r.id);
    ``;

    let menus;
    if (days.length) {
      menus = await db.queryArray('SELECT * FROM menus WHERE restaurant_id = ANY($1::int[]) AND day = ANY($2)', [
        allRestaurantIds,
        days,
      ]);
    } else {
      menus = await db.queryArray('SELECT * FROM menus WHERE restaurant_id = ANY($1::int[]) AND day >= CURRENT_DATE', [allRestaurantIds]);
    }
    console.log(menus);

    const response = allRestaurantIds.reduce((carry, restaurantId) => {
      const menuList = menus.filter(m => m[0] === restaurantId);
      carry[restaurantId] = menuList.reduce((menus, menu) => {
        menus[moment(menu[1]).format('YYYY-MM-DD')] = menu[2][c.var.lang];
        return menus;
      }, {});
      return carry;
    }, {} as Record<number, any>);
    return c.json(response);
  })
  // .get(
  //   '/restaurants/:restaurantId/menu(.:ext)?',
  //   handleRouteErrors(getRestaurantMenus),
  // )
  .get('/favorites', (c) => c.json(favorites.map((f) => replacei18nFields(f, c.var.lang))))
  .get('/areas', (c) => c.json(areasWithRestaurants))
  .get('/restaurants', (c) => {
    const restaurants = getRestaurantsForQuery(c.req.query());
    return c.json(restaurants.map((f) => replacei18nFields(f, c.var.lang)));
  });
