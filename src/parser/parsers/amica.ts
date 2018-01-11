import * as moment from 'moment';
import {flatten} from 'lodash';

import {Parser} from '../index';
import {json, formatUrl, propertyRegex, getWeeks, Property, createPropertyNormalizer} from '../utils';

const propertyMap = {
  '*': Property.HEALTHIER_CHOICE,
  'A': Property.CONTAINS_ALLERGENS,
  'G': Property.GLUTEN_FREE,
  'L': Property.LACTOSE_FREE,
  'M': Property.MILK_FREE,
  'Veg': Property.VEGAN,
  'VL': Property.LOW_IN_LACTOSE,
  'VS': Property.CONTAINS_GARLIC
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

async function parseWithDate(url, date) {
  const data = await json(formatUrl(url, date));
  return (data.MenusForDays ? data.MenusForDays.map(day => {
    const date = moment(day.Date.split('T')[0], 'YYYY-MM-DD');
    return {
      day: date.format('YYYY-MM-DD'),
      courses: day.SetMenus
      .map(x => x.Components.map(y => (x.Name ? (x.Name + ': ') : '') + y))
      .reduce((a, x) => a.concat(x), [])
      .map(course => {
        const regex = /\s\(.*\)$/;
        const properties = course.match(regex);
        return {
          title: course.replace(regex, ''),
          properties: properties ? normalizeProperties(properties[0].match(propertyRegex) || []) : []
        };
      })
    };
  }) : []).filter(day => day.courses.length);
}

const parser: Parser = {
  pattern: /www.amica.fi|www.fazerfoodco.fi/,
  async parse(url, lang) {
    url = url.replace('language=fi', 'language=' + lang);
    if (url.match('amica')) {
      const menusPerWeek = await Promise.all(
        getWeeks().map(date => parseWithDate(url, date))
      );
      return flatten(menusPerWeek);
    } else {
      return parseWithDate(url, moment());
    }
  }
};

export default parser;