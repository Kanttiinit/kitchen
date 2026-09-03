import xml2js from 'xml2js';
import moment from 'moment';
import { MenuProperty } from '../db.ts';

export const propertyRegex = /\b([A-Z]{1,2}|veg|vega)\b/gi;

export const days = {
  fi: [
    'maanantai',
    'tiistai',
    'keskiviikko',
    'torstai',
    'perjantai',
    'lauantai',
    'sunnuntai',
  ],
  en: [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ],
};

export function flatten<T>(array: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

export const getWeeks = () => [moment(), moment().add({ weeks: 1 })].map((d) => d.startOf('week').add({ days: 1 }));

export const formatUrl = (url: string, date = moment()) =>
  url
    .replace('%year%', date.format('YYYY'))
    .replace('%month%', date.format('MM'))
    .replace('%day%', date.format('DD'))
    .replace('%week%', date.format('w'));

const cache: Record<string, Promise<unknown>> = {};
const cachedJSONFetch = async (url: string) => {
  if (!(url in cache)) {
    const response = await fetch(url);
    cache[url] = response.json();
  }

  return cache[url];
};

export const json = (url: string) => cachedJSONFetch(url);
export const text = (url: string, setCookie = false) =>
  fetch(url)
    .then((r) => {
      if (setCookie) {
        const cookie = r.headers.get('set-cookie') ?? '';
        return fetch(url, {
          headers: {
            Cookie: cookie,
          },
        });
      } else {
        return r;
      }
    })
    .then((r) => r.text());

export const createPropertyNormalizer = (map: {
  [source: string]: MenuProperty;
}) =>
(properties: Array<string>) =>
  properties
    .map((p) => {
      const mapped = map[p];
      return mapped ? mapped : MenuProperty.IGNORE;
    })
    .filter((p) => p !== MenuProperty.IGNORE)
    .sort();

export function parseXml(xml: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, function (err: unknown, data: unknown) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export function parseCourse(input: string, propertyNormalizer: (p: string[]) => string[]) {
  const properties = [];
  let property = '';
  let i;
  for (i = input.length - 1; i > -1; i--) {
    const ch = input[i];
    if ((ch === ',' || ch === ' ') && property.length) {
      properties.push(property.trim());
      property = '';
    } else if (ch !== '(' && ch !== ')' && ch !== ',') {
      property = input[i] + property;
    }

    if (property.trim().length > 3) { break; }
  }
  return {
    title: input.substring(0, i + 4),
    properties: propertyNormalizer(properties),
  };
}
