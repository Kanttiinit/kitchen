import * as utils from '../utils';
import moment from 'moment';
import _ from 'lodash';

function parseWithDate(url, date) {
  return utils.json(utils.formatUrl(url, date))
  .then(json => {
    return (json.MenusForDays ? json.MenusForDays.map(day => {
      const date = moment(day.Date);
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
  });
}

export default {
  pattern: /www.amica.fi|www.fazerfoodco.fi/,
  async parse(url, lang) {
    if (url.match('amica')) {
      url = url.replace('language=fi', 'language=' + lang);
      const menusPerWeek = await Promise.all(
        utils.getWeeks().map(date => parseWithDate(url, date))
      );
      return _.flatten(menusPerWeek);
    } else {
      return parseWithDate(url, moment());
    }
  }
};
