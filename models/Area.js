module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Area', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name: {type: DataTypes.STRING, allowNull: false},
		image: DataTypes.STRING,
		locationRadius: DataTypes.INTEGER,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE
	}, {
		instanceMethods: {
			getPublicAttributes() {
				var output = {
					id: this.id,
					name: this.name,
					image: this.image,
					latitude: this.latitude,
					longitude: this.longitude,
					locationRadius: this.locationRadius
				};

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
