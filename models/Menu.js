module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Menu', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		date: {type: DataTypes.DATE, allowNull: false},
		courses: {type: DataTypes.JSON, allowNull: false}
	}, {
		classMethods: {
			associate(models) {
				models.Menu.belongsTo(models.Restaurant);
			}
		}
	});
};
