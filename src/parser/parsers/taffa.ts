import * as utils from '../utils';
import * as moment from 'moment';
import _ from 'lodash';
const {jsdom} = require('jsdom');

import {Parser} from '../index';

const transformProperties = props => props.map(p => p === 'K' ? 'MU' : p);

const parser: Parser = {
  pattern: /api.teknolog.fi/,
  async parse(url, lang) {
    const formattedUrl = url.replace('/fi/', '/' + lang + '/');
    const html = await utils.text(formattedUrl);
    // parse html
    const document = jsdom(html, {features: {QuerySelector: true}});

    // iterate through all <p> elements
    return _.map(document.querySelectorAll('p'), p => {
      const date = moment(p.textContent.split(/\s/).pop(), 'DD.MM.YYYY');
      // return courses for the day
      return {
        day: date.format('YYYY-MM-DD'),
        courses: _.map(p.nextElementSibling.querySelectorAll('li'), course => {
          const properties = course.textContent.match(/([A-Z]{1,2}\s?)+$/);
          // return course
          return {
            title: course.textContent.replace(/([A-Z]{1,2}\s?)+$/, '').trim(),
            properties: properties ? transformProperties(properties[0].match(utils.propertyRegex)) : []
          };
        })
        .filter(course => course.title) // filter out empty-titled courses
      };
    });
  }
};

export default parser;