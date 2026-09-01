import { Hono } from 'hono';
import { parse } from "@std/yaml";
import { createMiddleware } from 'hono/factory';

const restaurants = parse(Deno.readTextFileSync('data/restaurants.yml'));
const areas = parse(Deno.readTextFileSync('data/areas.yml'));
const favorites = parse(Deno.readTextFileSync('data/favorites.yml'));

// import { sortBy } from 'lodash';

// import changeRouter from './changeRouter';
// import getMenus from './getMenus';
// import getRestaurantMenus from './getRestaurantMenus';
// import getRestaurants from './getRestaurants';

export const parseLanguage = createMiddleware<{ Variables: { lang: 'fi' | 'en' } }>(async (c, next) => {
  const lang = c.req.query('lang') ?? 'fi';
  if (lang === 'fi' || lang === 'en') {
    c.set('lang', lang);
  } else {
    c.set('lang', 'fi');
  }
  await next();
});

// export const getAreas = async (req, res) => {
//   const areas = await models.Area.findAll({
//     where: { hidden: false },
//     include: [{ model: models.Restaurant }],
//   });
//   const data: any = await Promise.all(
//     areas.map((area) => area.getPublicAttributes(req.lang)),
//   );
//   if (req.query.idsOnly) {
//     const ids = data.map((area) => ({
//       ...area,
//       restaurants: sortBy(area.restaurants.map((r) => r.id)),
//     }));
//     res.json(ids);
//   } else {
//     res.json(data);
//   }
// };

export default new Hono()
  .use(parseLanguage)
  // .get('/menus', handleRouteErrors(getMenus))
  // .get(
  //   '/restaurants/:restaurantId/menu(.:ext)?',
  //   handleRouteErrors(getRestaurantMenus),
  // )
  .get('/favorites', c => c.json(favorites))
  // .get('/areas', handleRouteErrors(getAreas))
  // .get('/restaurants', handleRouteErrors(getRestaurants));
