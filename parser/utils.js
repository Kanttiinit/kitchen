const moment = require('moment');
const fetch = require('node-fetch');

const langs = ['en', 'fi'];

module.exports = {
   propertyRegex: /\b([A-Z]{1,2})\b/g,
   getWeeks: () => [moment(), moment().add({weeks: 1})].map(d => d.startOf('week').add({days: 1})),
   getFormattedUrls(url, date) {
   	date = date || moment();
   	return Array.from(new Set(
         langs.map(lang =>
            url
            .replace('%lang%', lang)
      		.replace('%year%', date.format('YYYY'))
      		.replace('%month%', date.format('MM'))
      		.replace('%day%', date.format('DD'))
         )
      ));
   },
   json: url => fetch(url).then(r => r.json()),
   text: url => fetch(url).then(r => r.text())
};
