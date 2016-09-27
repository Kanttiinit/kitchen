const xml2js = require('xml2js').parseString;
import * as utils from '../utils';
import moment from 'moment';

function parseXml(xml) {
   return new Promise((resolve, reject) => {
      xml2js(xml, function(err, data) {
         if (err)
            reject(err);
         resolve(data);
      });
   });
}

export default {
   pattern: /www\.hys\.net\/ruokalista\.xml/,
   parse: function(url) {
      return utils.text(url)
      .then(xml => parseXml(xml))
      .then(data => {
         return data.rss.channel[0].item
         .map(item => {
            const date = moment(item.title[0].split(' ')[1], 'DD.MM');
            return {
               day: date.format('YYYY-MM-DD'),
               courses: item.description[0].split(/\s*,\s*\<br\s\/\>\r\n/)
               .filter(c => c.trim().length)
               .map(_ => ({title: _, properties: []})),
            };
         });
      });
   }
}