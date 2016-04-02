const utils = require('../utils');
const moment = require('moment');

function parseWithDate(url, date) {
   return utils.json(utils.formatUrl(url, date))
   .then(json => {
      return json.MenusForDays.map(day => {
         const date = moment(day.Date);
         return {
            date: date.toDate(),
            day: date.format('YYYY-MM-DD'),
            courses: day.SetMenus
            .map(x => x.Components.map(y => (x.Name ? (x.Name + ': ') : '') + y))
            .reduce((a, x) => a.concat(x), [])
            .map(course => {
               const regex = /\s\(.+\)$/;
               const properties = course.match(regex);
               return {
                  title: course.replace(regex, ''),
                  properties: properties ? properties[0].match(utils.propertyRegex) : []
               };
            })
         };
      }).filter(day => day.courses.length);
   });
}

module.exports = {
   pattern: /www.amica.fi/,
   parser(url) {
      return Promise.all(
         utils.getWeeks()
         .map(date => parseWithDate(url, date))
      )
      .then(l => l.reduce((a, m) => a.concat(m), []));
   }
};
