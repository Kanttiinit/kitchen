module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Menu', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		date: {type: DataTypes.DATE, unique: true, allowNull: false},
		courses: {type: DataTypes.JSON, allowNull: false}
	});
};
