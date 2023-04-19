import { Property} from '../utils';
import * as moment from 'moment';
import * as utils from '../utils';

import { Parser } from '../index';

const propertyMap = {
  G: Property.GLUTEN_FREE,
  K: Property.VEGETARIAN,
  L: Property.LACTOSE_FREE,
  M: Property.MILK_FREE,
  O: Property.IGNORE,
  VL: Property.LOW_IN_LACTOSE
};


// Today: https://menu.hus.fi/HUSAromieMenus/FI/Default/HUS/Biomedicum/Rss.aspx?Id=e60502ff-6156-4198-b0b9-a33fab86d572&DateMode=0
// This week https://menu.hus.fi/HUSAromieMenus/FI/Default/HUS/Biomedicum/Rss.aspx?Id=e60502ff-6156-4198-b0b9-a33fab86d572&DateMode=1
// Next week https://menu.hus.fi/HUSAromieMenus/FI/Default/HUS/Biomedicum/Rss.aspx?Id=e60502ff-6156-4198-b0b9-a33fab86d572&DateMode=2
// English: FI -> EN 
// Swedish FI -> SV
const parser: Parser = {
  pattern: /menu\.hus\.fi/,
  async parse(url) {
    const xml = await utils.text(url);
    const json = await utils.parseXml(xml);
    return json.rss.channel[0].item.map(item => {
      const date = moment(item.title[0].split(' ')[1], 'DD.MM');
      return {
        day: date.format('YYYY-MM-DD'),
        courses: item.description[0]
          .split('<br>')
          .filter(c => c.trim().length)
          .map(title => ({ 
            title: title, 
            properties: []}))
      };
    });
  }
};

export default parser;
