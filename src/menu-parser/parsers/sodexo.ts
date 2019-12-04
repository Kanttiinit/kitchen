import {
  json,
  formatUrl,
  getWeeks,
  Property,
  createPropertyNormalizer
} from "../utils";
import * as moment from "moment";

const propertyMap = {
  G: Property.GLUTEN_FREE,
  M: Property.MILK_FREE,
  L: Property.LACTOSE_FREE,
  VL: Property.LOW_IN_LACTOSE
};

const normalizeProperties = createPropertyNormalizer(propertyMap);

interface Response {
  courses: {
    [index: string]: {
      title_fi: string;
      title_en: string;
      category: string;
      properties: string;
      price: string;
    };
  };
}

const parser = {
  pattern: /www.sodexo.fi/,
  async parse(url, lang) {
    const days = Array(8)
      .fill(0)
      .map((_, i) => moment().add({ days: i }));
    const menus = [];
    const parseWithDate = async date => {
      const response: Response = await json(formatUrl(url, date));
      if (response.courses) {
        menus.push({
          day: date.format("YYYY-MM-DD"),
          courses: Object.values(response.courses).map(course => ({
            title: lang === "fi" ? course.title_fi : course.title_en,
            properties: course.properties
              ? normalizeProperties(course.properties.split(", "))
              : []
          }))
        });
      }
    };
    await Promise.all(days.map(parseWithDate));
    return menus;
  }
};

export default parser;
