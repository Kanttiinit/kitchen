import moment from 'moment';

import { Parser } from '../index.ts';
import { createPropertyNormalizer, json } from '../utils.ts';
import { MenuProperty } from '../../db.ts';

const propertyMap = {
  G: MenuProperty.GLUTEN_FREE,
  K: MenuProperty.VEGETARIAN,
  L: MenuProperty.LACTOSE_FREE,
  M: MenuProperty.MILK_FREE,
  PÄ: MenuProperty.CONTAINS_NUTS,
  SE: MenuProperty.CONTAINS_CELERY,
  SO: MenuProperty.CONTAINS_SOY,
  V: MenuProperty.CONTAINS_GARLIC,
  VE: MenuProperty.VEGAN,
  VL: MenuProperty.LOW_IN_LACTOSE,
};

interface Course {
  name: string;
  meta: {
    '0': Array<string>;
  };
}

interface Menu {
  data: Array<Course>;
  date: string;
}

interface Restaurant {
  id: number;
  title: string;
  slug: string;
  menuData: {
    menus: Array<Menu>;
  };
}

const normalizeProperties = createPropertyNormalizer(propertyMap);

// Using slug instead of id because apparantly unicafe has different id for different languages
// Example URL: https://unicafe.fi/wp-json/swiss/v1/restaurants/?lang=language#terkko
const parser: Parser = {
  pattern: /unicafe\.fi/,
  async parse(url, lang) {
    const restaurants: Array<Restaurant> = await json(
      url.replace('%lang%', lang),
    );
    const [, slug] = url.split('#');
    const restaurant = restaurants.find((r) => r.slug === slug);
    if (restaurant) {
      return restaurant.menuData.menus
        .filter((m) => m.data.length > 0)
        .map((menu) => {
          const day = moment(menu.date, 'DD.MM.').format('YYYY-MM-DD');
          const courses = menu.data.map((course) => ({
            title: course.name,
            properties: normalizeProperties(course.meta[0]),
          }));
          return { day, courses };
        });
    } else {
      throw new Error('Restaurant not found in Unicafe data.');
    }
  },
};

export default parser;
