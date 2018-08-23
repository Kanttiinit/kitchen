import { json, Property, createPropertyNormalizer } from '../utils';
import * as moment from 'moment';

import { Parser } from '../index';

const propertyMap = {
  G: Property.GLUTEN_FREE,
  K: Property.VEGETARIAN,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  O: Property.IGNORE,
  VL: Property.LOW_IN_LACTOSE
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

const regExp = /([A-Z]{1,2})(?:,|$)/g;

const parseMenu = async (id: string) => {
  const data = await json(
    `http://lounasravintolat.ravioli.fi/AromiStorage/blob/menu/${id}`
  );
  return data.Days.map(day => {
    return {
      day: moment(day.Date).format('YYYY-MM-DD'),
      courses: day.Meals.map(meal => {
        const properties = meal.Name.match(regExp) || [];
        const cleanedProperties = Array.from(
          new Set<string>(properties.map(p => p.replace(',', '')))
        );
        return {
          title: `${meal.MealType}: ${meal.Name.replace(regExp, '')
          .replace('♥', '')
          .trim()}`,
          properties: normalizeProperties(cleanedProperties)
        };
      })
    };
  });
};

const parser: Parser = {
  pattern: /lounasravintolat\.ravioli\.fi/,
  async parse(url, lang) {
    const restaurantId = url.match(/#\/([a-zA-Z0-9\-]+)/)[1];
    if (!restaurantId) {
      throw new Error('Could not parse restaurant ID from URL.');
    }
    const restaurants = await json(
      'http://lounasravintolat.ravioli.fi/AromiStorage/blob/main/AromiMenusJsonData'
    );
    const restaurantData = restaurants.Restaurants.find(
      r => r.RestaurantId === restaurantId
    );
    if (!restaurantData) {
      throw new Error('Could not find restaurant data for the id provided.');
    }
    const menuIds = restaurantData.JMenus.map(m => m.MenuId);
    const allMenus = [];
    for (const menuId of menuIds) {
      for (const menu of await parseMenu(menuId)) {
        const existingDayIndex = allMenus.findIndex(m => m.day === menu.day);
        if (existingDayIndex > -1) {
          for (const course of menu.courses) {
            allMenus[existingDayIndex].courses.push(course);
          }
        } else {
          allMenus.push(menu);
        }
      }
    }
    return allMenus;
  }
};

export default parser;
