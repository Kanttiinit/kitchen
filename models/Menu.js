module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Menu', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		day: {type: DataTypes.DATE, allowNull: false},
		courses_i18n: {type: DataTypes.JSON, allowNull: false}
	}, {
		tableName: 'menus',
		instanceMethods: {
			getPublicAttributes(lang) {
				return {
					day: this.day,
					courses: this.courses
				};
			}
		},
		classMethods: {
			associate(models) {
				models.Menu.belongsTo(models.Restaurant);
			}
		}
	});
};
