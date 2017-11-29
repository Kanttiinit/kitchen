import * as moment from 'moment';

import {Parser} from '../index';
import {Property, json} from '../utils';

const propertyMap = {
  'G': Property.GLUTEN_FREE,
  'K': Property.VEGETARIAN,
  'L': Property.LACTOSE_FREE,
  'M': Property.MILK_FREE,
  'PÄ': Property.CONTAINS_NUTS,
  'SE': Property.CONTAINS_CELERY,
  'SO': Property.CONTAINS_SOY,
  'V': Property.CONTAINS_GARLIC,
  'VE': Property.VEGAN,
  'VL': Property.LOW_IN_LACTOSE
};

const parser: Parser = {
  pattern: /hyyravintolat\.fi/,
  async parse(url, lang) {
    const {data} = await json(url);
    return data
    .filter(m => m.data.length)
    .map(m => {
      const date = moment(m.date_en, 'ddd DD.MM.');
      return {
        day: date.format('YYYY-MM-DD'),
        courses: m.data.map(c => ({
          title: lang === 'fi' ? c.name : c.name_en,
          properties: c.meta[0].map(p => {
            const bracketedProp = p.match(/^\[(.+)\]$/);
            if (bracketedProp) {
              return bracketedProp[1];
            }
            return p;
          })
        }))
      };
    });
  }
};

export default parser;