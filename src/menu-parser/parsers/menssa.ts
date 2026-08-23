import * as moment from 'moment';
import { JSDOM } from 'jsdom';
import { Parser } from '..';
import { text, Property, createPropertyNormalizer } from '../utils';

const normalizeProperties = createPropertyNormalizer({
  G: Property.GLUTEN_FREE,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  S: Property.SOY_FREE,
  vegan: Property.VEGAN
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
      day => {
        const courses = (Array.from(
          day.querySelectorAll('.lms-front-dish')
        ) as any).map(dish => {
          const fiTitle = dish
            .querySelector('.lms-front-dish-name')
            .textContent.trim();
          const enTitle = dish
            .querySelector('.lms-front-en-name')
            ?.textContent.trim();
          const properties = (Array.from(
            dish.querySelectorAll('.lms-front-allergens, .lms-front-dietary')
          ) as any)
            .map(el => el.textContent.split(','))
            .reduce((a, b) => a.concat(b), [])
            .map(p => p.trim())
            .filter(p => p);

          return {
            title: (lang === 'en' && enTitle) || fiTitle,
            properties: normalizeProperties(properties)
          };
        });

        const menuItem = { day: date.format('YYYY-MM-DD'), courses };
        date.add({ days: 1 });
        return menuItem;
      }
    );
  }
};

export default parser;
