module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Restaurant', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name: DataTypes.STRING,
		logo: DataTypes.STRING,
		url: DataTypes.STRING,
		menuUrl: DataTypes.STRING,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE,
		openingHours: DataTypes.JSONB
	}, {
		classMethods: {
			associate(models) {
				models.Restaurant.hasMany(models.Menu, {as: 'Menus'});
			}
		}
	});
};
