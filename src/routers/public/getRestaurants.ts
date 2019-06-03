import * as models from '../../models';
import { Op } from 'sequelize';

export async function getRestaurantsByQuery(query: string) {
  const options = {
    model: models.Restaurant,
    mapToModel: true,
    replacements: { query: `%${query}%` }
  };
  const restaurants = await models.sequelize.query(
    `
    SELECT * FROM restaurants
    WHERE hidden = false AND (name_i18n->>'fi' ILIKE :query OR name_i18n->>'en' ILIKE :query)
  `,
    options
  );
  if (restaurants.length) {
    return restaurants;
  }
  return models.sequelize.query(
    `
      SELECT restaurants.* FROM restaurants, (
        SELECT * FROM areas
        WHERE (name_i18n->>'fi' ILIKE :query OR name_i18n->>'en' ILIKE :query) AND hidden = false
      ) as areas
      WHERE areas.id = restaurants."AreaId" AND restaurants.hidden = false;
    `,
    options
  );
}

export async function getRestaurantsByLocation(
  latitude: number,
  longitude: number,
  distance: number
) {
  return models.sequelize.query(
    `
      SELECT *
      FROM (
        SELECT *,
        (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance
        FROM restaurants
      ) as restaurants
      WHERE hidden = false AND distance < :distance
      ORDER BY distance;
    `,
    {
      model: models.Restaurant,
      mapToModel: true,
      replacements: { latitude, longitude, distance: distance / 1000 }
    }
  );
}

async function getRestaurantsByIds(ids: Array<string>) {
  const where: { id?: any; hidden: boolean } = { hidden: false };
  if (ids.length) {
    where.id = { [Op.in]: ids };
  }
  return models.Restaurant.findAll({ where });
}

function getRestaurantsForQuery(query) {
  if (query.query) {
    return getRestaurantsByQuery(query.query);
  } else if (query.location) {
    const [latitude, longitude] = query.location.split(',');
    const { distance = 2000 } = query;
    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
      throw { code: 400, message: 'Bad request.' };
    } else {
      return getRestaurantsByLocation(latitude, longitude, distance);
    }
  }

  const ids = (query.ids || '')
  .split(',')
  .filter(id => id && !isNaN(id))
  .map(id => Number(id));
  return getRestaurantsByIds(ids);
}

export default async function getRestaurants(req, res) {
  const restaurants = await getRestaurantsForQuery(req.query);
  const response = await Promise.all(
    restaurants.map(restaurant => restaurant.getPublicAttributes(req.lang))
  );
  res.json(response);
}
