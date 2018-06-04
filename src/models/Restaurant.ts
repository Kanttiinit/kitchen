import utils from './utils';
import { OpeningHour } from './index';

const publicAttrs = [
  'id',
  'type',
  'name',
  'url',
  'image',
  'latitude',
  'longitude',
  'address'
];

function formatHour(hour) {
  return String(hour).replace(/([0-9]{1,2})([0-9]{2})/, '$1:$2');
}

export default (sequelize, DataTypes) => {
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name_i18n: DataTypes.JSON,
      type: DataTypes.STRING,
      url: DataTypes.STRING,
      menuUrl: DataTypes.STRING,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
      address: DataTypes.STRING,
      openingHours: DataTypes.JSON,
      hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
      tableName: 'restaurants'
    }
  );

  Restaurant.prototype.getPublicAttributes = async function(
    lang,
    newOpeningHours
  ) {
    let openingHours;
    if (newOpeningHours) {
      openingHours = await OpeningHour.forRestaurant(this.id);
    } else {
      openingHours = this.getPrettyOpeningHours();
    }

    const output = {
      openingHours,
      distance:
        this.dataValues.distance && Math.round(this.dataValues.distance * 1000),
      ...utils.parsePublicParams(this, publicAttrs, lang)
    };

    if (this.Menus) {
      output.menus = this.Menus.map(m => m.getPublicAttributes(lang));
    }

    return output;
  };

  Restaurant.prototype.getPrettyOpeningHours = function() {
    return this.openingHours.map(curr => {
      if (curr) return formatHour(curr[0]) + ' - ' + formatHour(curr[1]);
      return null;
    });
  };

  return Restaurant;
};
