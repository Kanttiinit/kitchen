import * as moment from 'moment';
import {JSDOM} from 'jsdom';
import {Parser} from '..';
import {text, Property, createPropertyNormalizer} from '../utils';

const normalizeProperties = createPropertyNormalizer({
  '*': Property.HEALTHIER_CHOICE,
  'V': Property.VEGAN,
  'L': Property.LACTOSE_FREE,
  'M': Property.MILK_FREE,
  'G': Property.GLUTEN_FREE
});

const parser: Parser = {
  pattern: /^https?:\/\/kipsari.com/,
  async parse(url, lang) {
    const html = await text(url);
    const [_, name] = url.split('#');
    const {document} = new JSDOM(html, {features: {QuerySelector: true}}).window;
    const menuContainers: Array<any> = document.querySelectorAll('.kipsari-menu-open-container .erm_menu');
    const menuContainer = Array.from(menuContainers).find(
      container => container.querySelector('h1').textContent.toLowerCase().includes(name)
    );
    if (menuContainer) {
      const menus: Array<any> = menuContainer.querySelectorAll('.erm_product');
      return Array.from(menus)
      .map((element, i) => {
        const titleFi = element.querySelector('.erm_product_title').textContent.trim();
        const titleEn = element.querySelector('.erm_product_desc').textContent.trim();
        const matches = /^([a-z]+)([^\(]+)\((.+)+\)$/gi.exec(titleFi);
        if (matches) {
          const [_, dayOfWeek, title, properties] = matches;
          return {
            day: moment().isoWeekday(i + 1).format('YYYY-MM-DD'),
            courses: [{
              title: lang === 'fi' ? title.trim() : titleEn.split(' ').slice(1).join(' ').trim(),
              properties: normalizeProperties(properties.split(/,\s?/g))
            }]
          };
        }
      })
      .filter(Boolean);
    }
    return [];
  }
}

export default parser;
