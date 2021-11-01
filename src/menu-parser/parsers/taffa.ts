import * as moment from 'moment';
import { JSDOM } from 'jsdom';

import { Parser } from '../index';
import {
  text,
  Property,
  propertyRegex,
  createPropertyNormalizer
} from '../utils';

const propertyMap = {
  A: Property.CONTAINS_ALLERGENS,
  G: Property.GLUTEN_FREE,
  K: Property.EGG_FREE,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  S: Property.SOY_FREE,
  T: Property.HEALTHIER_CHOICE,
  VL: Property.LOW_IN_LACTOSE,
  Veg: Property.VEGAN
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

const regexp = /\(([A-Za-z]+(?:,\s?)?)+\)$/;

const parser: Parser = {
  pattern: /api.teknolog.fi/,
  async parse(url, lang) {
    const formattedUrl = url.replace('/fi/', '/' + lang + '/');
    const html = await text(formattedUrl);
    // parse html
    const { document } = new JSDOM(html, {
      features: { QuerySelector: true }
    }).window;

    // iterate through all <p> elements
    return Array.from(document.querySelectorAll('p')).map((p: any) => {
      const date = moment(p.textContent.split(/\s/).pop(), 'DD.MM.YYYY');
      // return courses for the day
      return {
        day: date.format('YYYY-MM-DD'),
        courses: Array.from(p.nextElementSibling.querySelectorAll('li'))
          .map((course: any) => {
            const properties = course.textContent.match(regexp);
            // return course
            return {
              title: course.textContent.replace(regexp, '').trim(),
              properties: properties
                ? normalizeProperties(properties[0].match(propertyRegex))
                : []
            };
          })
          .filter(course => course.title) // filter out empty-titled courses
      };
    });
  }
};

export default parser;
