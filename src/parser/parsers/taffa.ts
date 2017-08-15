import * as utils from '../utils';
import * as moment from 'moment';
import {JSDOM} from 'jsdom';

import {Parser} from '../index';

const regexp = /\(([A-Za-z]+(?:,\s?)?)+\)$/;

const transformProperties = props => props.map(p => p === 'K' ? 'MU' : p);

const parser: Parser = {
  pattern: /api.teknolog.fi/,
  async parse(url, lang) {
    const formattedUrl = url.replace('/fi/', '/' + lang + '/');
    const html = await utils.text(formattedUrl);
    // parse html
    const {document} = new JSDOM(html, {features: {QuerySelector: true}}).window;

    // iterate through all <p> elements
    return Array.from(document.querySelectorAll('p')).map((p: any) => {
      const date = moment(p.textContent.split(/\s/).pop(), 'DD.MM.YYYY');
      // return courses for the day
      return {
        day: date.format('YYYY-MM-DD'),
        courses: Array.from(p.nextElementSibling.querySelectorAll('li')).map((course: any) => {
          const properties = course.textContent.match(regexp);
          // return course
          return {
            title: course.textContent.replace(regexp, '').trim(),
            properties: properties ? transformProperties(properties[0].match(utils.propertyRegex)) : []
          };
        })
        .filter(course => course.title) // filter out empty-titled courses
      };
    });
  }
};

export default parser;