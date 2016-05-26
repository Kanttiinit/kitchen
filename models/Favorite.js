const utils = require('./utils');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Favorite', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
      name: DataTypes.STRING,
      regexp: DataTypes.STRING,
      icon: DataTypes.STRING
	}, {
		instanceMethods: {
			getPublicAttributes(lang) {
				return utils.parsePublicParams(this, ['id', 'name', 'regexp', 'icon'], lang);
			}
		}
	});
};
