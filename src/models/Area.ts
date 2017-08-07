import utils from './utils';
import getMap from '../utils/getMap';

const publicAttrs = ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius', 'mapImageUrl'];

export default (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    name_i18n: DataTypes.JSON,
    image: DataTypes.STRING,
    locationRadius: DataTypes.INTEGER,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    hidden: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    mapImageUrl: DataTypes.STRING
  }, {
    tableName: 'areas',
    hooks: {
      beforeUpdate: area => area.fetchMapImageUrl(),
      beforeCreate: area => area.fetchMapImageUrl()
    }
  });
  
  Area.prototype.getPublicAttributes = function(lang) {
    const output = utils.parsePublicParams(this, publicAttrs, lang);

    if (this.Restaurants)
      output.restaurants = this.Restaurants.map(r => r.getPublicAttributes(lang));

    return output;
  };

  Area.prototype.fetchMapImageUrl = async function() {
    this.mapImageUrl = await getMap({latitude: this.latitude, longitude: this.longitude, radius: this.locationRadius});
  };

  return Area;
};