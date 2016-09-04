module.exports = function(sequelize, DataTypes) {
	return sequelize.define('User', {
		displayName: {type: DataTypes.STRING, allowNull: false},
		email: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    preferences: {type: DataTypes.JSON, allowNull: false, defaultValue: {}},
    admin: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false}
	}, {
    tableName: 'users'
  });
};
