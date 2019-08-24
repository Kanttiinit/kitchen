const xml2js = require('xml2js').parseString;
import * as moment from 'moment';
import fetch from 'node-fetch';

export const propertyRegex = /\b([A-Z]{1,2}|veg)\b/gi;

export const getWeeks = () =>
  [moment(), moment().add({ weeks: 1 })].map(d =>
    d.startOf('week').add({ days: 1 })
  );

export const formatUrl = (url, date = moment()) =>
  url
    .replace('%year%', date.format('YYYY'))
    .replace('%month%', date.format('MM'))
    .replace('%day%', date.format('DD'))
    .replace('%week%', date.format('w'));

const cache = {};
const cachedJSONFetch = async url => {
  if (!(url in cache)) {
    const response = await fetch(url);
    cache[url] = response.json();
  }

  return cache[url];
};

export const json = url => cachedJSONFetch(url);
export const text = url => fetch(url).then(r => r.text());

export enum Property {
  CONTAINS_ALLERGENS = 'A+',
  CONTAINS_CELERY = 'C+',
  EGG_FREE = 'E',
  GLUTEN_FREE = 'G',
  HEALTHIER_CHOICE = 'H',
  LACTOSE_FREE = 'L',
  LOW_IN_LACTOSE = 'LL',
  MILK_FREE = 'M',
  CONTAINS_NUTS = 'N+',
  CONTAINS_GARLIC = 'O+',
  SOY_FREE = 'S',
  CONTAINS_SOY = 'S+',
  VEGETARIAN = 'V',
  VEGAN = 'VV',
  IGNORE = '?'
}

export const createPropertyNormalizer = (map: {
  [source: string]: Property;
}) => (properties: Array<string>) =>
  properties
    .map(p => {
      const mapped = map[p];
      return mapped ? mapped : Property.IGNORE;
    })
    .filter(p => p !== Property.IGNORE)
    .sort();

export function parseXml(xml): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js(xml, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
