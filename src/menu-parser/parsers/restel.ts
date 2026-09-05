import moment from 'moment';

import { createPropertyNormalizer, formatUrl, json, propertyRegex } from '../utils.ts';
import { Parser } from '../index.ts';
import { MenuProperty } from '../../db.ts';

const normalizeProperties = createPropertyNormalizer({
  G: MenuProperty.GLUTEN_FREE,
  M: MenuProperty.MILK_FREE,
  L: MenuProperty.LACTOSE_FREE,
  VE: MenuProperty.VEGETARIAN,
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
    const data: any = await json(formatUrl(url));
    const referenceDate = moment(
      `${data.lunch_weeks}-${data.list_year}`,
      'WW-YYYY',
    );
    return Object.keys(data.lunch_items).map((weekday) => {
      const date = referenceDate.clone().day(weekday);
      const courses = data.lunch_items[weekday];
      return {
        day: date.format('YYYY-MM-DD'),
        courses: courses.items.map((course: any) => ({
          title: course.dish_name
            .trim()
            .replace(/\([^\)]+\)/, '')
            .trim(),
          properties: normalizeProperties(course.dish_name.match(propertyRegex) ?? []),
        })),
      };
    });
  },
};

export default parser;
