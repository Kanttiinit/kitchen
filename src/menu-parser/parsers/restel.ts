import * as moment from 'moment';

import {
  json,
  Property,
  createPropertyNormalizer,
  propertyRegex
} from '../utils';
import { Parser } from '..';

const normalizeProperties = createPropertyNormalizer({
  G: Property.GLUTEN_FREE,
  M: Property.MILK_FREE,
  L: Property.LACTOSE_FREE,
  VE: Property.VEGETARIAN
});

type Response = {
  list_year: string;
  lunch_weeks: string;
  lunch_items: {
    [weekday: string]: {
      info: string;
      items: Array<{
        dish_name: string;
        dish_price: string;
        dish_allergy_info: string;
      }>;
    };
  };
};

const parser: Parser = {
  pattern: /restel\.fi/,
  async parse(url) {
    const data: Response = await json(url);
    const referenceDate = moment(
      `${data.lunch_weeks}-${data.list_year}`,
      'WW-YYYY'
    );
    return Object.keys(data.lunch_items).map(weekday => {
      const date = referenceDate.clone().day(weekday);
      const courses = data.lunch_items[weekday];
      return {
        day: date.format('YYYY-MM-DD'),
        courses: courses.items.map(course => ({
          title: course.dish_name
          .trim()
          .replace(/\([^\)]+\)/, '')
          .trim(),
          properties: normalizeProperties(course.dish_name.match(propertyRegex))
        }))
      };
    });
  }
};

export default parser;
