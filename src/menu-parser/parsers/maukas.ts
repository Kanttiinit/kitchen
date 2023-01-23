import * as utils from '../utils';
import { JSDOM } from 'jsdom';
import * as moment from 'moment';

import { Parser } from '../index';
import { days, Property } from '../utils';

const propertyNormalizer = utils.createPropertyNormalizer({
  'G': Property.GLUTEN_FREE,
  'M': Property.MILK_FREE,
  'L': Property.LACTOSE_FREE,
  'SE': Property.CONTAINS_CELERY,
  'PÄ': Property.CONTAINS_NUTS,
  'SO': Property.CONTAINS_SOY,
  'VS': Property.CONTAINS_GARLIC
});

const parser: Parser = {
  pattern: /mau-kas\.fi/,
  async parse(url, lang) {
    if (lang === 'en') {
      url = url.replace('.fi/', '.fi/en/');
    }
    const html = await utils.text(url);
    const document = new JSDOM(html).window.document;
    let currentNode: any = Array.from(document.querySelectorAll('*')).find((n: any) => n.textContent.trim().toLowerCase() === days[lang][0]);
    const date = moment().startOf('isoWeek');
    let menuItems = [];
    let courses = [];
    while (currentNode = currentNode.nextSibling) {
      const text = currentNode.textContent.trim();
      if (currentNode.tagName === 'P' && text !== '') {
        if (days[lang].includes(text.toLowerCase())) {
          menuItems.push({ day: date.format('YYYY-MM-DD'), courses });
          courses = [];
          date.add({ days: 1 });
        } else {
          courses.push(utils.parseCourse(text, propertyNormalizer));
        }
      }
    }
    menuItems.push({ day: date.format('YYYY-MM-DD'), courses });
    return menuItems;
  }
};

export default parser;
