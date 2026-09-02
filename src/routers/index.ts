import { Hono } from 'hono';
import moment from 'moment';

import changeRouter from './changes.ts';
import contactRouter from './contact.ts';

import { getRestaurantsForQuery } from './restaurant-queries.ts';
import { areasWithRestaurantIds, areasWithRestaurants, favorites, restaurants } from '../../data/data.ts';
import { db, Menu } from '../db.ts';
import { HTTPException } from 'hono/http-exception';
import { formatFields, formatIds, parseLanguage } from '../utils.ts';

export default new Hono()
  .get('/help', (c) => c.redirect('https://github.com/Kanttiinit/kitchen'))
  .route('/contact', contactRouter)
  .route('/changes', changeRouter)
  .use(parseLanguage)
  .get('/menus', async (c) => {
    const restaurantIds = formatIds(c.req.query('restaurants') ?? '');
    const areaIds = formatIds(c.req.query('areas') ?? '');
    const days = (c.req.query('days') ?? '')
      .split(',')
      .map((day) => moment(day))
      .filter((m) => m.isValid())
      .map((d) => d.format('YYYY-MM-DD'));

    const allRestaurantIds = restaurants.filter((r) => restaurantIds?.includes(r.id) || areaIds?.includes(r.areaId))
      .map((r) => r.id);
    ``;

    let menus;
    if (days.length) {
      menus = await db.queryArray<Menu>('SELECT * FROM menus WHERE restaurant_id = ANY($1::int[]) AND day = ANY($2)', [
        allRestaurantIds,
        days,
      ]);
    } else {
      menus = await db.queryArray<Menu>(
        'SELECT * FROM menus WHERE restaurant_id = ANY($1::int[]) AND day >= CURRENT_DATE',
        [
          allRestaurantIds,
        ],
      );
    }

    const response = allRestaurantIds.reduce((carry, restaurantId) => {
      const menuList = menus.filter((m) => m.restaurant_id === restaurantId);
      carry[restaurantId] = menuList.reduce((menus, menu) => {
        menus[moment(menu.day).format('YYYY-MM-DD')] = menu.courses_i18n[c.var.lang];
        return menus;
      }, {} as Record<string, any>);
      return carry;
    }, {} as Record<number, any>);
    return c.json(response);
  })
  .get(
    '/restaurants/:restaurantId/menu',
    async (c) => {
      const restaurantId = Number(c.req.param('restaurantId'));

      const day = moment(c.req.query('day')).format('YYYY-MM-DD');

      const restaurant = restaurants.find((r) => r.id === restaurantId);

      if (!restaurant) {
        throw new HTTPException(404, { message: 'Restaurant not found.' });
      }

      const menu = await db.queryObject<Menu>('SELECT * FROM menus WHERE restaurant_id = $1 AND day = $2', [
        restaurant?.id,
        day,
      ]);
      return c.json(formatFields({
        ...restaurant,
        menus: menu
          ? [{
            day: moment(menu.day).format('YYYY-MM-DD'),
            courses_i18n: menu.courses_i18n,
          }]
          : [],
      }, c.var.lang));
    },
  )
  .get('/favorites', (c) => c.json(formatFields(favorites, c.var.lang)))
  .get(
    '/areas',
    (c) => c.json(formatFields(c.req.query('idsOnly') ? areasWithRestaurantIds : areasWithRestaurants, c.var.lang)),
  )
  .get('/restaurants', (c) => {
    const restaurants = getRestaurantsForQuery(c.req.query());
    return c.json(formatFields(restaurants, c.var.lang));
  });
