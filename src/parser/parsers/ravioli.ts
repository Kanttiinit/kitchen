import * as utils from '../utils';
import * as moment from 'moment';
import {JSDOM} from 'jsdom';

import {Parser} from '../index';

const regExp = /([A-Z]{1,2})(?:,|$)/g;

const parseMenu = async (id: string) => {
  const data = await utils.json(`http://lounasravintolat.ravioli.fi/AromiStorage/blob/menu/${id}`);
  return data.Days.map(day => {
    return {
      day: moment(day.Date).format('YYYY-MM-DD'),
      courses: day.Meals.map(meal => {
        const properties = meal.Name.match(regExp) || [];
        return {
          title: `${meal.MealType}: ${meal.Name.replace(regExp, '').replace('♥', '').trim()}`,
          properties: Array.from(new Set(properties.map(p => p.replace(',', ''))))
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
    const restaurants = await utils.json('http://lounasravintolat.ravioli.fi/AromiStorage/blob/main/AromiMenusJsonData');
    const restaurantData = restaurants.Restaurants.find(r => r.RestaurantId === restaurantId);
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
