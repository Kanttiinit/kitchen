const utils = require('./utils');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Area', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name: {type: DataTypes.STRING, allowNull: false},
		name_i18n: DataTypes.JSON,
		image: DataTypes.STRING,
		locationRadius: DataTypes.INTEGER,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE
	}, {
		instanceMethods: {
			getPublicAttributes(lang) {
				const public = ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius'];
				var output = utils.parsePublicParams(this, public, lang);

				if (this.Restaurants)
					output.restaurants = this.Restaurants.map(r => r.getPublicAttributes());

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
