import moment from 'moment';

import { Parser } from '../index.ts';
import { createPropertyNormalizer, json } from '../utils.ts';
import { MenuProperty } from '../../db.ts';

const normalizeProperties = createPropertyNormalizer({
  G: MenuProperty.GLUTEN_FREE,
  L: MenuProperty.LACTOSE_FREE,
  M: MenuProperty.MILK_FREE,
  Mu: MenuProperty.EGG_FREE,
  VEG: MenuProperty.VEGAN,
  '*': MenuProperty.HEALTHIER_CHOICE,
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
    const kitchens = await json(url.replace('%lang%', lang)) as Response;

    // The same day can appear under several menu types, so collect the
    // courses of a day into a single menu.
    const days = new Map<
      number,
      Array<{ title: string; properties: Array<MenuProperty> }>
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
                if (!title || courses.some((c) => c.title === title)) {
                  continue;
                }
                courses.push({
                  title,
                  properties: normalizeProperties(
                    (item.diets || '').split(',').map((d: any) => d.trim()),
                  ),
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
        courses,
      }));
  },
};

export default parser;
