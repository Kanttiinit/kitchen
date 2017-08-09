import * as utils from '../utils';
import * as moment from 'moment';
import {flatten} from 'lodash';

import {Parser} from '../index';

async function parseWithDate(url, date) {
  const json = await utils.json(utils.formatUrl(url, date));
  return (json.MenusForDays ? json.MenusForDays.map(day => {
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
          properties: properties ? properties[0].match(utils.propertyRegex) || [] : []
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
        utils.getWeeks().map(date => parseWithDate(url, date))
      );
      return flatten(menusPerWeek);
    } else {
      return parseWithDate(url, moment());
    }
  }
};

export default parser;