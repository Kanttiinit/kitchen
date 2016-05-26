module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Menu', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		date: {type: DataTypes.DATE, allowNull: false},
		day: {type: DataTypes.STRING, allowNull: false},
		courses: {type: DataTypes.JSON, allowNull: false}
	}, {
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
