import * as moment from 'moment';
import { JSDOM } from 'jsdom';

import { Parser } from '../index';
import {
  text,
  Property,
  propertyRegex,
  createPropertyNormalizer
} from '../utils';

const dateRegExp = /(\d+).(\d+)./g;

const parseToDate = (possiblyDate: string): string | null => {
  const match = dateRegExp.exec(possiblyDate);
  return match
    ? moment(match[0], 'DD.M').format('YYYY-MM-DD')
    : null;
};
const propertyMap = {
  PÄ: Property.CONTAINS_ALLERGENS,
  VS: Property.CONTAINS_ALLERGENS,
  G: Property.GLUTEN_FREE,
  V: Property.VEGAN,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  VL: Property.LOW_IN_LACTOSE
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

interface Course {
  title: string;
  properties: Array<Property>;
};

const parseToCourse = (possiblyCourse: string): Course | null => {
  if (possiblyCourse.trim() === '') {
    return null;
  }
  const [rawTitle, rawProperties] = possiblyCourse.split(' (');
  return {
    title: rawTitle.trim(),
    properties: normalizeProperties(rawProperties.match(propertyRegex))
  };
};

const parser: Parser = {
  pattern: /compassgroup/,
  async parse(url, lang) {
    const html = await text(url);
    const document = new JSDOM(html).window.document;

    const container = document.querySelector('#mid-column');
    const elements = [...container.querySelectorAll('p')];

    const indexOfFirstNotCourseElement = elements.findIndex(
      e => e.textContent.includes('Muutokset ovat mahdollisia')
    );

    const courseElements = elements.slice(0, indexOfFirstNotCourseElement - 1);

    return Array.from(courseElements.reduce((acc: any, curr: any) => {
      const rowAsDate = parseToDate(curr.textContent);
      if (rowAsDate) {
        return [...acc, {
          day: rowAsDate,
          courses: Array.from([])
        }];
      }
      const rowAsCourse = parseToCourse(curr.textContent);
      if (rowAsCourse) {
        acc[acc.length - 1].courses.push(rowAsCourse);
      }
      return acc;
    }, []));
  }
};

export default parser;
