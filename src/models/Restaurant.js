import utils from './utils';

const publicAttrs = ['id', 'type', 'name', 'url', 'image', 'latitude', 'longitude', 'address'];

function formatHour(hour) {
  return String(hour).replace(/([0-9]{1,2})([0-9]{2})/, '$1:$2');
}

export default (sequelize, DataTypes) => {
  return sequelize.define('Restaurant', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    name_i18n: DataTypes.JSON,
    type: DataTypes.STRING,
    url: DataTypes.STRING,
    menuUrl: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    address: DataTypes.STRING,
    openingHours: DataTypes.JSON
  }, {
    tableName: 'restaurants',
    instanceMethods: {
      getPublicAttributes(lang) {
        var output = Object.assign({
          openingHours: this.getPrettyOpeningHours(),
          distance: this.dataValues.distance && Math.round(this.dataValues.distance * 1000)
        }, utils.parsePublicParams(this, publicAttrs, lang));

        if (this.Menus)
          output.menus = this.Menus.map(m => m.getPublicAttributes(lang));

        return output;
      },
      getPrettyOpeningHours() {
        return this.openingHours.map(curr => {
          if (curr)
            return formatHour(curr[0]) + ' - ' + formatHour(curr[1]);
          return null;
        });
      }
    }
  });
};
