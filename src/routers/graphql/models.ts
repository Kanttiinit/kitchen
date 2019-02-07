import { Area, Restaurant, Menu, Favorite } from '../../models';

class GraphQLModel {
  constructor(fields) {
    Object.assign(this, fields.get({ plain: true }));
  }
}

type Lang = 'fi' | 'en';

export class GraphQLArea extends GraphQLModel {
  id: number;
  name: string;
  lang: Lang;

  constructor(fields, lang) {
    super(fields);
    this.name = fields.name_i18n[lang] || fields.name_i18n.fi;
    this.lang = lang;
  }

  restaurants = async () => {
    const items = await Restaurant.findAll({ where: { AreaId: this.id } });
    return items.map(item => new GraphQLRestaurant(item, this.lang));
  };
}

export class GraphQLRestaurant extends GraphQLModel {
  id: number;
  AreaId: number;
  name: string;
  lang: Lang;

  constructor(fields, lang) {
    super(fields);
    this.name = fields.name_i18n[lang] || fields.name_i18n.fi;
    this.lang = lang;
  }

  area = async () => {
    const item = await Area.findOne({ where: { id: this.AreaId } });
    return new GraphQLArea(item, this.lang);
  };

  menus = async ({ day }) => {
    const items = await Menu.findAll({
      where: { RestaurantId: this.id, day: new Date(day) }
    });
    return items.map(item => new GraphQLMenu(item, this.lang));
  };
}

export class GraphQLMenu extends GraphQLModel {
  courses: Array<any>;
  courses_i18n: { fi: Array<any>; en: Array<any> };

  constructor(fields, lang) {
    super(fields);
    this.courses = this.courses_i18n[lang];
  }
}
