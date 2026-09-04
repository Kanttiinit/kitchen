import moment from 'moment';
import { createPropertyNormalizer, json } from '../utils.ts';
import { Parser } from '../index.ts';
import { MenuProperty } from '../../db.ts';

const propertyMap = {
  A: MenuProperty.CONTAINS_ALLERGENS,
  G: MenuProperty.GLUTEN_FREE,
  K: MenuProperty.EGG_FREE,
  L: MenuProperty.LACTOSE_FREE,
  M: MenuProperty.MILK_FREE,
  Soijaton: MenuProperty.SOY_FREE,
  T: MenuProperty.HEALTHIER_CHOICE,
  VL: MenuProperty.LOW_IN_LACTOSE,
  Veg: MenuProperty.VEGAN,
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

const ignoredKeys = ['dayName', 'day'];

const parser: Parser = {
  pattern: /newapi\.tf\.fi/,
  async parse(url: string, lang: string): Promise<any[]> {
    let formattedUrl = url.replace('/fi/', '/' + lang + '/');
    const data = await json(formattedUrl);
    return data.map((day: any) => {
      const courses = Object.keys(day)
        .filter((k) => !ignoredKeys.includes(k))
        .map((key) => {
          const match = day[key].match(/\(([A-Za-z,\s]+)\)/);
          const properties = match ? match[1].split(',').map((p: string) => p.trim()) : [];
          return {
            title: day[key].replace(/\s*\([A-Za-z,\s]+\)\s*$/, '').trim(),
            properties: normalizeProperties(properties),
          };
        })
        .filter((course) => course.title);
      return {
        day: moment(day.day, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        courses,
      };
    });
  },
};

export default parser;
