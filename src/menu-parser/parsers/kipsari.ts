import moment from 'moment';
import { JSDOM } from 'jsdom';
import { Parser } from '../index.ts';
import { createPropertyNormalizer, parseXml, text } from '../utils.ts';
import { MenuProperty } from '../../db.ts';

const normalizeProperties = createPropertyNormalizer({
  '*': MenuProperty.HEALTHIER_CHOICE,
  V: MenuProperty.VEGAN,
  L: MenuProperty.LACTOSE_FREE,
  M: MenuProperty.MILK_FREE,
  G: MenuProperty.GLUTEN_FREE,
});

// 👼👼👼👼👼
const handleKipsariLang = (url: string, lang: 'fi' | 'en') => {
  if (lang === 'en') {
    if (url.includes('rss-studio')) {
      return url.replace('rss-studio', 'rss-studio-english');
    } else if (url.includes('rss-vare')) {
      return url.replace('rss-vare', 'rss-vare-english');
    }
  }
  return url;
};

const getDateFormat = (lang: 'fi' | 'en') => {
  if (lang === 'en') {
    return 'YYYY-MM-DD';
  } else {
    return 'DD.MM.YYYY';
  }
};

const parser: Parser = {
  pattern: /^https?:\/\/www.kipsari.com/,
  async parse(raw_url, lang) {
    let url = handleKipsariLang(raw_url, lang);
    const xml: any = await parseXml(await text(url));
    const items = xml.rss.channel[0].item;
    return items.map(({ title, description }: any) => {
      const day = moment(title[0].split(', ')[1], getDateFormat(lang)).format(
        'YYYY-MM-DD',
      );
      const { document } = new JSDOM(description[0], {
        features: { QuerySelector: true },
      }).window;
      return {
        day,
        courses: (Array.from(document.querySelectorAll('span')) as any).map(
          (course: any) => {
            const match = course.textContent.trim().match(/\(.+\)$/gi);
            return {
              title: course.textContent.trim().replace(/\(.+\)$/, ''),
              properties: match ? normalizeProperties(match[0].split(/,\s?/g)) : [],
            };
          },
        ),
      };
    });
  },
};

export default parser;
