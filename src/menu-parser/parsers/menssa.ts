import { MenuItem, Parser } from '..';
import {
  createPropertyNormalizer,
  Property,
  propertyRegex,
  text
} from '../utils';
import { JSDOM } from 'jsdom';
import * as moment from 'moment';

const propertyMap = {
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  G: Property.GLUTEN_FREE,
  V: Property.VEGETARIAN,
  S: Property.HEALTHIER_CHOICE
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

// match a date in the format of DD.MM.YYYY
const dateRegex = /\b\d{1,2}\.\d{1,2}\.\d{4}\b/;

// match properties in course's name
const coursePropertiesRegex = /\(([A-Za-z]+(?:,\s?)?)+\)$/;

// split multiple courses in one line, e.g. "RIISI (V,G,S) PERUNAMUUSI (L,G,S)"
const coursesSplitRegex = /[^()]+\([^()]*\)|[^()]+/g;

const parser: Parser = {
  pattern: /menssa.fi/,
  async parse(url, lang) {
    // no english menu available
    if (lang === 'en') {
      return [];
    }

    const html = await text(url);

    const { document } = new JSDOM(html, {
      features: { QuerySelector: true }
    }).window;
    const nodeList = document.querySelectorAll('h3, p');

    const courseList: Array<MenuItem> = [];
    let isParsingCoursesFlag = false;

    for (const dom of nodeList) {
      // if the element is h3, stop parsing courses and reset the flag
      if (dom.nodeName === 'H3') {
        isParsingCoursesFlag = false;
        continue;
      }

      const elementText: string = dom.textContent.trim();
      // if the element is p and matches a date, set the falg to true, start parsing courses from the next element
      if (dom.nodeName === 'P' && elementText.match(dateRegex)) {
        isParsingCoursesFlag = true;

        const date = moment(elementText, 'DD.MM.YYYY');
        courseList.push({ day: date.format('YYYY-MM-DD'), courses: [] });
        continue;
      }

      // if the element is p and the flag is active, parse course details
      if (dom.nodeName === 'P' && isParsingCoursesFlag === true) {
        // multiple courses may apperar on one line, so split the text
        const courses = elementText.match(coursesSplitRegex) || [];

        // iterate through all courses on the same line
        courses.forEach(courseText => {
          const properties = courseText.match(coursePropertiesRegex);

          courseList[courseList.length - 1].courses.push({
            title: courseText.replace(coursePropertiesRegex, '').trim(),
            properties: properties
              ? normalizeProperties(properties[0].match(propertyRegex))
              : []
          });
        });
      }
    }

    return courseList;
  }
};

export default parser;
