import utils from './utils';

export default (sequelize, DataTypes) => {
	return sequelize.define('Area', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name_i18n: DataTypes.JSON,
		image: DataTypes.STRING,
		locationRadius: DataTypes.INTEGER,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE
	}, {
		tableName: 'areas',
		instanceMethods: {
			getPublicAttributes(lang) {
				const publicAttrs = ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius'];
				var output = utils.parsePublicParams(this, publicAttrs, lang);

				if (this.Restaurants)
					output.restaurants = this.Restaurants.map(r => r.getPublicAttributes(lang));

				return output;
			}
		},
		classMethods: {
			associate(models) {
				models.Area.hasMany(models.Restaurant);
			}
		}
	});
};
