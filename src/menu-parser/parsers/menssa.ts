import moment from 'moment';
import { JSDOM } from 'jsdom';
import { Parser } from '../index.ts';
import { createPropertyNormalizer, text } from '../utils.ts';
import { MenuProperty } from '../../db.ts';

const normalizeProperties = createPropertyNormalizer({
  G: MenuProperty.GLUTEN_FREE,
  L: MenuProperty.LACTOSE_FREE,
  M: MenuProperty.MILK_FREE,
  S: MenuProperty.SOY_FREE,
  vegan: MenuProperty.VEGAN,
});

// https://menssa.fi/lounas/

// https://menssa.fi/wp-json/lms/v1/lunch/today --> only that day's

const parser: Parser = {
  pattern: /menssa\.fi/,
  async parse(url, lang) {
    const html = await text(url);
    const document = new JSDOM(html).window.document;
    const date = moment().startOf('isoWeek');

    return (Array.from(document.querySelectorAll('.lms-front-day')) as any).map(
      (day: any) => {
        const courses = (Array.from(
          day.querySelectorAll('.lms-front-dish'),
        ) as any).map((dish: any) => {
          const fiTitle = dish
            .querySelector('.lms-front-dish-name')
            .textContent.trim();
          const enTitle = dish
            .querySelector('.lms-front-en-name')
            ?.textContent.trim();
          const properties = (Array.from(
            dish.querySelectorAll('.lms-front-allergens, .lms-front-dietary'),
          ) as any)
            .map((el: any) => el.textContent.split(','))
            .reduce((a: any, b: any) => a.concat(b), [])
            .map((p: any) => p.trim())
            .filter((p: any) => p);

          return {
            title: (lang === 'en' && enTitle) || fiTitle,
            properties: normalizeProperties(properties),
          };
        });

        const menuItem = { day: date.format('YYYY-MM-DD'), courses };
        date.add({ days: 1 });
        return menuItem;
      },
    );
  },
};

export default parser;
