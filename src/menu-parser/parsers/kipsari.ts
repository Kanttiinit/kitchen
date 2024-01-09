import * as moment from 'moment';
import { JSDOM } from 'jsdom';
import { Parser } from '..';
import { text, Property, createPropertyNormalizer, parseXml } from '../utils';

const normalizeProperties = createPropertyNormalizer({
  '*': Property.HEALTHIER_CHOICE,
  V: Property.VEGAN,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  G: Property.GLUTEN_FREE
});

// 👼👼👼👼👼
const handleKipsariLang = (url, lang) => {
  if (lang === 'en') {
    if (url.includes('rss-studio')) {
      return url.replace('rss-studio', 'rss-studio-english');
    } else if (url.includes('rss-vare')) {
      return url.replace('rss-vare', 'rss-vare-english');
    }
  }
  return url;
};

const parser: Parser = {
  pattern: /^https?:\/\/www.kipsari.com/,
  async parse(raw_url, lang) {
    let url = handleKipsariLang(raw_url, lang);
    const xml = await parseXml(await text(url));
    const items = xml.rss.channel[0].item;
    return items.map(({ title, description }) => {
      const day = moment(title[0].split(', ')[1], 'DD.MM.YYYY').format('YYYY-MM-DD');
      const { document } = new JSDOM(description[0], {
        features: { QuerySelector: true }
      }).window;
      return {
        day,
        courses: (Array.from(document.querySelectorAll('span')) as any).map(
          course => {
            const match = course.textContent.trim().match(/\(.+\)$/gi);
            return {
              title: course.textContent.trim().replace(/\(.+\)$/, ''),
              properties: match
                ? normalizeProperties(match[0].split(/,\s?/g))
                : []
            };
          }
        )
      };
    });
  }
};

export default parser;
