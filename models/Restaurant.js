const worker = require('../worker.js');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Restaurant', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name: DataTypes.STRING,
		image: DataTypes.STRING,
		url: DataTypes.STRING,
		menuUrl: DataTypes.STRING,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE,
		openingHours: DataTypes.JSON
	}, {
		classMethods: {
			associate(models) {
				models.Restaurant.hasMany(models.Menu);
				models.Restaurant.belongsTo(models.Area);
			}
		}
	});
};
