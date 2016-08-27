const moment = require('moment');
const fetch = require('node-fetch');

module.exports = {
  propertyRegex: /\b([A-Z]{1,2})\b/g,
  getWeeks: () => [moment(), moment().add({weeks: 1})].map(d => d.startOf('week').add({days: 1})),
  formatUrl: (url, date = moment()) =>
    url
      .replace('%year%', date.format('YYYY'))
      .replace('%month%', date.format('MM'))
      .replace('%day%', date.format('DD')),
  json: url => fetch(url).then(r => r.json()),
  text: url => fetch(url).then(r => r.text())
};
