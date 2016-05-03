module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Favorite', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
      name: DataTypes.STRING,
      regexp: DataTypes.STRING,
      icon: DataTypes.STRING
	}, {
		classMethods: {
			getPublicAttributes() {
				return ['id', 'name', 'regexp', 'icon'];
			}
		}
	});
};
