const utils = require('../utils');
const moment = require('moment');

module.exports = {
   pattern: /hyyravintolat\.fi/,
   parser(url) {
      return utils.json(url)
      .then(json =>
         json.data.filter(m => m.data.length)
         .map(m => {
            const date = moment(m.date_en, 'ddd DD.MM.');
            return {
               date: date.toDate(),
               day: date.format('YYYY-MM-DD'),
               courses: m.data.map(c =>
                  ({
                     title: c.name,
                     properties: c.meta[0]
                  })
               )
            };
         })
      );
   }
};
