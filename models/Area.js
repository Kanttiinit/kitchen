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
				var output = {
					id: this.id,
					name: this.name,
					image: this.image,
					latitude: this.latitude,
					longitude: this.longitude,
					locationRadius: this.locationRadius
				};

				this.attributes
				.filter(v => v.endsWith('_i18n'))
				.forEach(key => {
					output['test-' + key.replace('_i18n', '')] = this.dataValues[key][lang];
				});

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
