import * as moment from 'moment';
import fetch from 'node-fetch';

export const propertyRegex = /\b([A-Z]{1,2}|veg)\b/gi;

export const getWeeks = () =>
  [moment(), moment().add({weeks: 1})].map(d => d.startOf('week').add({days: 1}));

export const formatUrl = (url, date = moment()) =>
  url
    .replace('%year%', date.format('YYYY'))
    .replace('%month%', date.format('MM'))
    .replace('%day%', date.format('DD'));


export const json = url => fetch(url).then(r => r.json());
export const text = url => fetch(url).then(r => r.text());
