import { createPropertyNormalizer, json } from '../utils.ts';
import { Parser } from '../index.ts';
import moment from 'moment';
import { MenuProperty } from '../../db.ts';

const propertyMap = {
  G: MenuProperty.GLUTEN_FREE,
  M: MenuProperty.MILK_FREE,
  L: MenuProperty.LACTOSE_FREE,
  VL: MenuProperty.LOW_IN_LACTOSE,
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

interface Response {
  timeperiod: string; // 17.2. - 23.2.
  mealdates: Array<{
    date: string; // "Monday" or "Maanantai"
    courses: {
      [n: string]: {
        title_fi: string;
        title_en: string;
        properties: string | null;
      };
    };
  }>;
}

const normaliseWeekday = (weekday: string) => {
  switch (weekday.toLowerCase()) {
    case 'maanantai':
      return 'monday';
    case 'tiistai':
      return 'tuesday';
    case 'keskiviikko':
      return 'wednesday';
    case 'torstai':
      return 'thursday';
    case 'perjantai':
      return 'friday';
    case 'lauantai':
      return 'saturday';
    case 'sunnuntai':
      return 'sunday';
    default:
      return weekday;
  }
};

const parser: Parser = {
  pattern: /www.sodexo.fi/,
  async parse(url, lang) {
    const response: Response = await json(url);
    const firstDate = moment().startOf('isoWeek');
    return response.mealdates.map((day) => {
      return {
        day: moment(firstDate)
          .day(normaliseWeekday(day.date))
          .format('YYYY-MM-DD'),
        courses: Object.values(day.courses)
          .map((course) => ({
            title: lang == 'fi' ? course.title_fi : course.title_en,
            properties: course.properties ? normalizeProperties(course.properties.split(', ')) : [],
          }))
          .filter((course) => !!course.title),
      };
    });
  },
};

export default parser;
