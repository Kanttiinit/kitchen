module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Area', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name: {type: DataTypes.STRING, allowNull: false},
		image: DataTypes.STRING,
		locationRadius: DataTypes.INTEGER,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE
	}, {
		classMethods: {
			associate(models) {
				models.Area.hasMany(models.Restaurant);
			},
			getPublicAttributes() {
				return ['id', 'name', 'image', 'latitude', 'longitude', 'locationRadius'];
			}
		}
	});
};
