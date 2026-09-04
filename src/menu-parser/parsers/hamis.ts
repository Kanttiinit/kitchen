import moment from 'moment';
import * as utils from '../utils.ts';

import { Parser } from '../index.ts';

const parser: Parser = {
  pattern: /hys\.net/,
  async parse(url) {
    const xml = await utils.text(url);
    const json = await utils.parseXml(xml) as any;
    return json.rss.channel[0].item.map((item) => {
      const date = moment(item.title[0].split(' ')[1], 'DD.MM');
      return {
        day: date.format('YYYY-MM-DD'),
        courses: item.description[0]
          .split('<br />')
          .filter((c) => c.trim().length)
          .map((title) => ({ title: title.trim(), properties: [] })),
      };
    });
  },
};

export default parser;
