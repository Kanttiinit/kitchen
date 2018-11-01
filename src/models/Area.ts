import utils from './utils';

const publicAttrs = ['id', 'name', 'latitude', 'longitude', 'locationRadius'];

export default (sequelize, DataTypes) => {
  const Area = sequelize.define(
    'Area',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name_i18n: DataTypes.JSON,
      locationRadius: DataTypes.INTEGER,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'areas'
    }
  );

  Area.prototype.getPublicAttributes = async function(lang) {
    const output = utils.parsePublicParams(this, publicAttrs, lang);

    if (this.Restaurants) {
      output.restaurants = await Promise.all(
        this.Restaurants.map(r => r.getPublicAttributes(lang))
      );
    }

    return output;
  };

  return Area;
};
