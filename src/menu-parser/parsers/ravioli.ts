import * as moment from 'moment';
import * as utils from '../utils';

import { Parser } from '../index';
import { propertyRegex, Property, createPropertyNormalizer } from '../utils';

const propertyMap = {
  G: Property.GLUTEN_FREE,
  K: Property.VEGETARIAN,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  O: Property.IGNORE,
  VL: Property.LOW_IN_LACTOSE,
  VEGA: Property.VEGAN
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

// Today: https://menu.hus.fi/HUSAromieMenus/FI/Default/HUS/Biomedicum/Rss.aspx?Id=e60502ff-6156-4198-b0b9-a33fab86d572&DateMode=0
// This week https://menu.hus.fi/HUSAromieMenus/FI/Default/HUS/Biomedicum/Rss.aspx?Id=e60502ff-6156-4198-b0b9-a33fab86d572&DateMode=1
// Next week https://menu.hus.fi/HUSAromieMenus/FI/Default/HUS/Biomedicum/Rss.aspx?Id=e60502ff-6156-4198-b0b9-a33fab86d572&DateMode=2
const parser: Parser = {
  pattern: /menu\.hus\.fi/,
  async parse(url, lang) {
    if (lang != 'fi') {
      url = url.replace('/FI/', '/' + lang.toUpperCase() + '/');
    }
    const xml = await utils.text(url);
    const json = await utils.parseXml(xml);
    return (json.rss.channel[0]
      ? json.rss.channel[0].item.map(item => {
          var date = null;
          if (lang === 'fi') {
            date = moment(item.title[0].split(' ')[1], 'DD.MM');
          }
          if (lang === 'en') {
            date = moment(item.title[0].split(' ')[1], 'MM/DD/YYYY');
          }
          return {
            day: date.format('YYYY-MM-DD'),
            courses: item.description[0]
              .split('<br>')
              .map(x => ({
                name: x.split(/:\s?/).length > 1 ? x.split(':')[0] : '',
                components: x
                  .split(/:\s?/)
                  [x.split(/:\s?/).length - 1].split(/\)[,|\s]/)
                  .filter(k => k.length > 0)
                  .map(z => (z.endsWith(')') ? z : z + ')'))
              }))
              .map(x =>
                x.components.map(y => (x.name ? x.name + ': ' : '') + y)
              )
              .reduce((a, x) => a.concat(x), [])
              .map(course => {
                const regex = /\s\(.*\)$/;
                const properties = course.match(regex);
                return {
                  title: course.replace(regex, ''),
                  properties: properties
                    ? normalizeProperties(
                        properties[0].match(propertyRegex) || []
                      )
                    : []
                };
              })
          };
        })
      : []
    ).filter(day => day.courses.length);
  }
};

export default parser;
