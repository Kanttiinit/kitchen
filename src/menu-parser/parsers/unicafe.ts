import * as moment from 'moment';

import { Parser } from '../index';
import { Property, json, createPropertyNormalizer } from '../utils';

const propertyMap = {
  G: Property.GLUTEN_FREE,
  K: Property.VEGETARIAN,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  PÄ: Property.CONTAINS_NUTS,
  SE: Property.CONTAINS_CELERY,
  SO: Property.CONTAINS_SOY,
  V: Property.CONTAINS_GARLIC,
  VE: Property.VEGAN,
  VL: Property.LOW_IN_LACTOSE
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
    console.log(lang)
    const restaurants: Array<Restaurant> = await json(
      url.replace('language', lang)
    );
    const [, slug] = url.split('#');
    const restaurant = restaurants.find(r => r.slug === slug);
    if (restaurant) {
      return restaurant.menuData.menus
        .filter(m => m.data.length > 0)
        .map(menu => {
          const day = moment(menu.date, 'DD.MM.').format('YYYY-MM-DD');
          const courses = menu.data.map(course => ({
            title: course.name,
            properties: normalizeProperties(course.meta[0])
          }));
          return { day, courses };
        });
    } else {
      throw new Error('Restaurant not found in Unicafe data.');
    }
  }
};

export default parser;
