const utils = require('../utils');
const moment = require('moment');

module.exports = {
   pattern: /hyyravintolat\.fi/,
   parse(url, lang) {
      return utils.json(url)
      .then(json =>
         json.data.filter(m => m.data.length)
         .map(m => {
            const date = moment(m.date_en, 'ddd DD.MM.');
            return {
               day: date.format('YYYY-MM-DD'),
               courses: m.data.map(c =>
                  ({
                     title: lang === 'fi' ? c.name : c.name_en,
                     properties: c.meta[0].map(p => {
                       const bracketedProp = p.match(/^\[(.+)\]$/);
                       if (bracketedProp) {
                         return bracketedProp[1];
                       }
                       return p;
                     })
                  })
               )
            };
         })
      );
   }
};
