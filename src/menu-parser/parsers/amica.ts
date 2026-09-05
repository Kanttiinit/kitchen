import moment from 'moment';

import { Parser } from '../index.ts';
import { createPropertyNormalizer, flatten, formatUrl, getWeeks, json, propertyRegex } from '../utils.ts';
import { MenuProperty } from '../../db.ts';

const propertyMap = {
  '*': MenuProperty.HEALTHIER_CHOICE,
  A: MenuProperty.CONTAINS_ALLERGENS,
  G: MenuProperty.GLUTEN_FREE,
  L: MenuProperty.LACTOSE_FREE,
  M: MenuProperty.MILK_FREE,
  Veg: MenuProperty.VEGAN,
  VL: MenuProperty.LOW_IN_LACTOSE,
  VS: MenuProperty.CONTAINS_GARLIC,
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

async function parseWithDate(url: string, date: moment.Moment) {
  const data = await json(formatUrl(url, date)) as any;
  return (data.MenusForDays
    ? data.MenusForDays.map((day: any) => {
      const date = moment(day.Date.split('T')[0], 'YYYY-MM-DD');
      return {
        day: date.format('YYYY-MM-DD'),
        courses: day.SetMenus.map((x: any) => x.Components.map((y) => [x.Name ? x.Name + ': ' : '', y]))
          .reduce((a: any, x: any) => a.concat(x), [])
          .map(([groupName, course]) => {
            const regex = /\s\(.*\)$/;
            const properties = course.match(regex);
            return {
              title: groupName + course.replace(regex, ''),
              properties: properties
                ? normalizeProperties(
                  properties[0].match(propertyRegex) || [],
                )
                : [],
            };
          }),
      };
    })
    : []).filter((day: any) => day.courses.length);
}

const parser: Parser = {
  pattern: /www\.amica\.fi|www\.foodandco\.fi\/modules|compass\-group\.fi\/menuapi/,
  async parse(url, lang) {
    url = url.replace('language=fi', 'language=' + lang);
    if (url.match('amica')) {
      const menusPerWeek = await Promise.all(
        getWeeks().map((date) => parseWithDate(url, date)),
      );
      return flatten(menusPerWeek);
    } else {
      return parseWithDate(url, moment());
    }
  },
};

export default parser;
