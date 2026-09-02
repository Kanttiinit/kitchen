import { HTTPException } from 'hono/http-exception';
import Haversine from '@neabyte/haversine';
import { areas, Restaurant, restaurants } from '../../../data/data.ts';

export function getRestaurantsByQuery(query: string) {
  query = query.toLowerCase();
  const results = restaurants.filter((r) =>
    r.name_i18n.en.toLowerCase().includes(query) || r.name_i18n.fi.toLowerCase().includes(query)
  );
  if (results.length > 0) {
    return results;
  }
  const areaResults = areas.filter((a) =>
    a.name_i18n.en.toLowerCase().includes(query) || a.name_i18n.fi.toLowerCase().includes(query)
  );
  const areaRestaurants = [];
  for (const area of areaResults) {
    areaRestaurants.push(...restaurants.filter((r) => r.areaId = area.id));
  }
  return areaRestaurants;
}

export function getRestaurantsByLocation(
  latitude: number,
  longitude: number,
  distanceInMeters: number,
) {
  return restaurants.filter((r) =>
    Haversine.calculate({ lat: latitude, lon: longitude }, { lat: r.latitude, lon: r.longitude }, 'm') <=
      distanceInMeters
  );
}

export function getRestaurantsByIds(
  ids: Array<number>,
  priceCategories: Array<string>,
) {
  return restaurants.filter((r) => ids.includes(r.id) && priceCategories.includes(r.priceCategory));
}

export function getRestaurantsForQuery(query: Record<string, string>): Restaurant[] {
  if (query.query) {
    return getRestaurantsByQuery(query.query);
  } else if (query.location) {
    const [latitudeString, longitudeString] = query.location.split(',');
    const latitude = Number(latitudeString);
    const longitude = Number(longitudeString);
    const distance = Number(query.distance) ?? 2000;
    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
      throw new HTTPException(400, { message: 'Bad request.' });
    } else {
      return getRestaurantsByLocation(latitude, longitude, distance);
    }
  }

  const ids = (query.ids || '')
    .split(',')
    .map((id) => Number(id))
    .filter((id) => id && !isNaN(id));
  const priceCategories = (query.priceCategories || '')
    .split(',')
    .filter((c) => ['regular', 'student', 'studentPremium'].includes(c));
  return getRestaurantsByIds(ids, priceCategories);
}
