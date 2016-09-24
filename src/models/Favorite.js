import utils from './utils';

export default (sequelize, DataTypes) => {
	return sequelize.define('Favorite', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name_i18n: DataTypes.JSON,
		regexp: DataTypes.STRING,
      icon: DataTypes.STRING
	}, {
		tableName: 'favorites',
		instanceMethods: {
			getPublicAttributes(lang) {
				return utils.parsePublicParams(this, ['id', 'name', 'regexp', 'icon'], lang);
			}
		}
	});
};
