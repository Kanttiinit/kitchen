import * as moment from 'moment';
import { Property, createPropertyNormalizer, json } from '../utils';
import { Parser } from '..';

const propertyMap = {
  A: Property.CONTAINS_ALLERGENS,
  G: Property.GLUTEN_FREE,
  K: Property.EGG_FREE,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  Soijaton: Property.SOY_FREE,
  T: Property.HEALTHIER_CHOICE,
  VL: Property.LOW_IN_LACTOSE,
  Veg: Property.VEGAN
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

const ignoredKeys = ['dayName', 'day'];

const parser: Parser = {
  pattern: /newapi\.tf\.fi/,
  async parse(url: string, lang: string): Promise<any[]> {
    let formattedUrl = url.replace('/fi/', '/' + lang + '/');
    const data = await json(formattedUrl);
    return data.map(day => {
      const courses = Object.keys(day)
        .filter(k => !ignoredKeys.includes(k))
        .map(key => {
          const match = day[key].match(/\(([A-Za-z,\s]+)\)/);
          const properties = match
            ? match[1].split(',').map((p: string) => p.trim())
            : [];
          return {
            title: day[key].replace(/\s*\([A-Za-z,\s]+\)\s*$/, '').trim(),
            properties: normalizeProperties(properties)
          };
        })
        .filter(course => course.title);
      return {
        day: moment(day.day, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        courses
      };
    });
  }
};

export default parser;
