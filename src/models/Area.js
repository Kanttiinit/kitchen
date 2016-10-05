import utils from './utils';

const publicAttrs = ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius'];

export default (sequelize, DataTypes) => {
  return sequelize.define('Area', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    name_i18n: DataTypes.JSON,
    image: DataTypes.STRING,
    locationRadius: DataTypes.INTEGER,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    hidden: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
  }, {
    tableName: 'areas',
    instanceMethods: {
      getPublicAttributes(lang) {
        var output = utils.parsePublicParams(this, publicAttrs, lang);

        if (this.Restaurants)
          output.restaurants = this.Restaurants.map(r => r.getPublicAttributes(lang));

        return output;
      }
    }
  });
};
