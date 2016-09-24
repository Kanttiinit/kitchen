import utils from './utils';
import moment from 'moment';

export default (sequelize, DataTypes) => {
	return sequelize.define('Menu', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		day: {type: DataTypes.DATEONLY, allowNull: false},
		courses_i18n: {type: DataTypes.JSON, allowNull: false}
	}, {
		tableName: 'menus',
		instanceMethods: {
			getPublicAttributes(lang) {
				const publicParams = utils.parsePublicParams(this, ['day', 'courses'], lang);
				publicParams.day = moment(publicParams.day).format('YYYY-MM-DD');
				return publicParams;
			}
		},
		classMethods: {
			associate(models) {
				models.Menu.belongsTo(models.Restaurant);
			}
		}
	});
};
