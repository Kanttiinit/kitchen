import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

import { getRestaurantsForQuery } from './getRestaurants.ts';
import { areasWithRestaurants, favorites, restaurants } from '../../../data/data.ts';
import { db } from '../../db.ts';
import moment from 'moment';
import { HTTPException } from 'hono/http-exception';
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

function replacei18nFields(node: unknown, lang: 'fi' | 'en'): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => replacei18nFields(item, lang));
  }

  if (typeof node !== 'object' || node === null) {
    return node;
  }

  const obj = node as { [key: string]: unknown };
  const output: { [key: string]: unknown } = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    const isI18nObj = key.endsWith('_i18n') &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value);

    if (isI18nObj) {
      const map = value as { [key: string]: unknown };
      const normalizedKey = key.slice(0, -'_i18n'.length);
      const fallbackKey = Object.keys(map)[0];
      const picked = lang in map ? map[lang] : (fallbackKey !== undefined ? map[fallbackKey] : null);
      output[normalizedKey] = replacei18nFields(picked, lang);
    } else {
      output[key] = replacei18nFields(value, lang);
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
      menus = await db.queryArray('SELECT * FROM menus WHERE restaurant_id = ANY($1::int[]) AND day >= CURRENT_DATE', [
        allRestaurantIds,
      ]);
    }
    console.log(menus);

    const response = allRestaurantIds.reduce((carry, restaurantId) => {
      const menuList = menus.filter((m) => m[0] === restaurantId);
      carry[restaurantId] = menuList.reduce((menus, menu) => {
        menus[moment(menu[1]).format('YYYY-MM-DD')] = menu[2][c.var.lang];
        return menus;
      }, {});
      return carry;
    }, {} as Record<number, any>);
    return c.json(response);
  })
  .get(
    '/restaurants/:restaurantId/menu',
    async (c) => {
      const restaurantId = Number(c.req.param('restaurantId'));
      console.log(restaurantId);

      const day = moment(c.req.query('day')).format('YYYY-MM-DD');

      const restaurant = restaurants.find(r => r.id === restaurantId);

      if (!restaurant) {
        throw new HTTPException(404, { message: 'Restaurant not found.' });
      }

      const menu = await db.queryObject('SELECT * FROM menus WHERE restaurant_id = $1 AND day = $2', [restaurant?.id, day]);
      return c.json(replacei18nFields({
        ...restaurant,
        menu: {
          day: moment(menu.day).format('YYYY-MM-DD'),
          courses_i18n: menu.courses_i18n
        }
      }, c.var.lang));
    },
  )
  .get('/favorites', (c) => c.json(replacei18nFields(favorites, c.var.lang)))
  .get('/areas', (c) => c.json(replacei18nFields(areasWithRestaurants, c.var.lang)))
  .get('/restaurants', (c) => {
    const restaurants = getRestaurantsForQuery(c.req.query());
    return c.json(replacei18nFields(restaurants, c.var.lang));
  });
