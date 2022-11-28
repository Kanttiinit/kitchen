import * as moment from 'moment';
import { flatten } from 'lodash';
import { Parser } from '../index';

import { json, formatUrl, createPropertyNormalizer, Property } from '../utils';

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
  G: Property.GLUTEN_FREE,
  L: Property.LACTOSE_FREE,
  VL: Property.LOW_IN_LACTOSE,
  M: Property.MILK_FREE,
  '*': Property.HEALTHIER_CHOICE,
  Veg: Property.VEGAN,
  VS: Property.CONTAINS_GARLIC,
  A: Property.CONTAINS_ALLERGENS
});

const parser: Parser = {
  pattern: /www\.foodandco\.fi\/api/,
  async parse(url, lang) {
    url = url.replace('language=fi', 'language=' + lang);
    const data: MenuFormat = await json(formatUrl(url, moment()));

    return data.LunchMenus.map(menu => ({
      day: moment(menu.Date, menu.Date.includes('/') ? 'M/D/YYYY' : 'D.M.YYYY').format('YYYY-MM-DD'),
      courses: flatten(
        menu.SetMenus.map(m => {
          let unknownGroup = 1;
          return m.Meals.map(course => ({
            title: `${m.Name ? m.Name : 'Lunch ' + unknownGroup++}: ${
              course.Name
            }`,
            properties: normalizeProperties(course.Diets)
          }));
        })
      )
    }));
  }
};

export default parser;
