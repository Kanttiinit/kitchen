import * as moment from 'moment';

import {json, formatUrl, getWeeks, Property} from '../utils';
import {Parser} from '../index';

const propertyMap = {
  'G': Property.GLUTEN_FREE,
  'M': Property.MILK_FREE,
  'L': Property.LACTOSE_FREE,
  'VL': Property.LOW_IN_LACTOSE
};

const parser = {
  pattern: /www.sodexo.fi/,
  async parse(url, lang) {
    const days = [];
    const parseWithDate = async date => {
      const feed = await json(formatUrl(url, date));
      for (let day in feed.menus) {
        const timestamp = moment(date).day(day);
        days.push({
          day: timestamp.format('YYYY-MM-DD'),
          courses: feed.menus[day].map(course => ({
            title: lang === 'fi' ? course.title_fi : course.title_en,
            properties: course.properties ? course.properties.split(', ') : []
          }))
        });
      }
    };
    await Promise.all(getWeeks().map(parseWithDate));
    return days;
  }
};

export default parser;