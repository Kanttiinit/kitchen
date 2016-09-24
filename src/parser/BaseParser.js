import moment from 'moment';
import fetch from 'node-fetch';

export default class Parser {
  propertyRegex = /\b([A-Z]{1,2})\b/g;
  getWeeks() {
    return [moment(), moment().add({weeks: 1})].map(d => d.startOf('week').add({days: 1}));
  }
  formatUrl(url, date = moment()) {
    return url
    .replace('%year%', date.format('YYYY'))
    .replace('%month%', date.format('MM'))
    .replace('%day%', date.format('DD'));
  }
  json(url) {
    return fetch(url).then(r => r.json());
  }
  text(url) {
    return fetch(url).then(r => r.text());
  }
}
