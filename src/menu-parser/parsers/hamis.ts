const xml2js = require('xml2js').parseString;
import * as utils from '../utils';
import * as moment from 'moment';

import { Parser } from '../index';

function parseXml(xml): Promise<any> {
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

const parser: Parser = {
  pattern: /www\.hys\.net\/ruokalista\.xml/,
  async parse(url) {
    const xml = await utils.text(url);
    const json = await parseXml(xml);
    return json.rss.channel[0].item.map(item => {
      const date = moment(item.title[0].split(' ')[1], 'DD.MM');
      return {
        day: date.format('YYYY-MM-DD'),
        courses: item.description[0]
        .split(/\s*,\s*\<br\s\/\>\r\n/)
        .filter(c => c.trim().length)
        .map(_ => ({ title: _, properties: [] }))
      };
    });
  }
};

export default parser;
