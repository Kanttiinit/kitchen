import moment from 'moment';
import { Parser } from '../index.ts';

import { createPropertyNormalizer, flatten, formatUrl, json } from '../utils.ts';
import { MenuProperty } from '../../db.ts';

type MenuFormat = {
  LunchMenus: Array<{
    Date: string;
    SetMenus: Array<{
      Name: string;
      Meals: Array<{
        Name: string;
        Diets: Array<string>;
      }>;
    }>;
  }>;
};

const normalizeProperties = createPropertyNormalizer({
  G: MenuProperty.GLUTEN_FREE,
  L: MenuProperty.LACTOSE_FREE,
  VL: MenuProperty.LOW_IN_LACTOSE,
  M: MenuProperty.MILK_FREE,
  '*': MenuProperty.HEALTHIER_CHOICE,
  Veg: MenuProperty.VEGAN,
  VS: MenuProperty.CONTAINS_GARLIC,
  A: MenuProperty.CONTAINS_ALLERGENS,
});

const parser: Parser = {
  pattern: /www\.foodandco\.fi\/api/,
  async parse(url, lang) {
    url = url.replace('language=fi', 'language=' + lang);
    const data = await json(formatUrl(url, moment())) as MenuFormat;

    return data.LunchMenus.map((menu) => ({
      day: moment(
        menu.Date,
        menu.Date.includes('/') ? 'M/D/YYYY' : 'D.M.YYYY',
      ).format('YYYY-MM-DD'),
      courses: flatten(
        menu.SetMenus.map((m) => {
          let unknownGroup = 1;
          return m.Meals.map((course) => ({
            title: `${m.Name ? m.Name : 'Lunch ' + unknownGroup++}: ${course.Name}`,
            properties: normalizeProperties(course.Diets),
          }));
        }),
      ),
    }));
  },
};

export default parser;
