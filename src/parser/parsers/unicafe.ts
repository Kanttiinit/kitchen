import * as utils from '../utils';
import * as moment from 'moment';

import {Parser} from '../index';

const parser: Parser = {
  pattern: /hyyravintolat\.fi/,
  async parse(url, lang) {
    const json = await utils.json(url);
    return json.data
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