import {Sequelize, Model, DataTypes} from 'sequelize';
import {Options, Attribute} from 'sequelize-decorators';
import utils from './utils';
import getMap from '../utils/getMap';
import {sequelize} from './';

const publicAttrs = ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius', 'mapImageUrl'];

@Options({
  sequelize,
  tableName: 'areas',
  hooks: {
    beforeUpdate: area => area.fetchMapImageUrl(),
    beforeCreate: area => area.fetchMapImageUrl()
  }
})
class Area extends Model {
  @Attribute({
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  })
  id: number;

  @Attribute(DataTypes.JSON)
  name_i18n: {fi: string, en: string};

  @Attribute(DataTypes.STRING)
  image: string;

  @Attribute(DataTypes.INTEGER)
  locationRadius: number;

  @Attribute(DataTypes.DOUBLE)
  latitude: number;

  @Attribute(DataTypes.DOUBLE)
  longitude: number;

  @Attribute({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  hidden: boolean;

  @Attribute(DataTypes.STRING)
  mapImageUrl: string;

  getPublicAttributes(lang) {
    const output = utils.parsePublicParams(this, publicAttrs, lang);

    if (this.Restaurants)
      output.restaurants = this.Restaurants.map(r => r.getPublicAttributes(lang));

    return output;
  }

  async fetchMapImageUrl() {
    this.mapImageUrl = await getMap({latitude: this.latitude, longitude: this.longitude, radius: this.locationRadius});
  }
}

export default Area;