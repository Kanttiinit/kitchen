import * as utils from '../utils';
import {JSDOM} from 'jsdom';
import * as moment from 'moment';

import {Parser} from '../index';

const parser: Parser = {
  pattern: /mau-kas\.fi/,
  async parse(url, lang) {
    const html = await utils.text(url);
    const document = new JSDOM(html).window.document;
    return Array.from(document.querySelectorAll('.restaurant_menu')).map((dayElement: any, i) => {
      const courseNames = Array.from(dayElement.querySelectorAll('.restaurant_menuitemname'));
      const courseProperties = dayElement.querySelectorAll('.restaurant_menuitemdescription');
      return {
        day: moment().weekday(i + 1).format('YYYY-MM-DD'),
        courses: courseNames.map((course: any, j) => {
          const [finnish, english] = course.textContent.trim().split('/');
          const properties = courseProperties[j];
          const title = lang === 'fi' ? finnish : english || finnish;
          return {
            title: title ? title.trim() : '',
            properties: properties ? properties.textContent.split(/,\s?/) : []
          };
        })
      };
    })
    .filter(menu => menu.courses.length);
  }
};

export default parser;