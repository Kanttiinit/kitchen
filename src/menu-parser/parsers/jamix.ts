import * as moment from 'moment';

import { Parser } from '..';
import { json, Property, createPropertyNormalizer } from '../utils';

const normalizeProperties = createPropertyNormalizer({
  G: Property.GLUTEN_FREE,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  Mu: Property.EGG_FREE,
  VEG: Property.VEGAN,
  '*': Property.HEALTHIER_CHOICE
});

interface MenuItem {
  name: string;
  diets: string; // "G, M, Mu, VEG, *"
}

interface Day {
  date: number; // 20260831
  mealoptions: Array<{
    name: string; // the buffet line, e.g. "ROOTS VEGAN"
    menuItems: Array<MenuItem>;
  }>;
}

type Response = Array<{
  kitchenName: string;
  menuTypes: Array<{
    menus: Array<{
      days: Array<Day>;
    }>;
  }>;
}>;

// Example URL:
// https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/93077/79?lang=%lang%
// where 93077 is the customer id and 79 the kitchen id.
const parser: Parser = {
  pattern: /jamix\.cloud/,
  async parse(url, lang) {
    const kitchens: Response = await json(url.replace('%lang%', lang));

    // The same day can appear under several menu types, so collect the
    // courses of a day into a single menu.
    const days = new Map<
      number,
      Array<{ title: string; properties: Array<Property> }>
    >();

    for (const kitchen of kitchens) {
      for (const menuType of kitchen.menuTypes) {
        for (const menu of menuType.menus) {
          for (const day of menu.days) {
            const courses = days.get(day.date) || [];
            for (const mealoption of day.mealoptions) {
              for (const item of mealoption.menuItems) {
                const title = item.name.trim();
                // Items without a translation come back with an empty name.
                if (!title || courses.some(c => c.title === title)) {
                  continue;
                }
                courses.push({
                  title,
                  properties: normalizeProperties(
                    (item.diets || '').split(',').map(d => d.trim())
                  )
                });
              }
            }
            days.set(day.date, courses);
          }
        }
      }
    }

    return Array.from(days)
      .filter(([, courses]) => courses.length)
      .map(([date, courses]) => ({
        day: moment(String(date), 'YYYYMMDD').format('YYYY-MM-DD'),
        courses
      }));
  }
};

export default parser;
