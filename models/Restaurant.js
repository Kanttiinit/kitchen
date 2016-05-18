const moment = require('moment');

function formatHour(hour) {
	return String(hour).replace(/([0-9]{1,2})([0-9]{2})/, '$1:$2');
}

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Restaurant', {
		id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
		name: DataTypes.STRING,
		image: DataTypes.STRING,
		url: DataTypes.STRING,
		menuUrl: DataTypes.STRING,
		latitude: DataTypes.DOUBLE,
		longitude: DataTypes.DOUBLE,
		address: DataTypes.STRING,
		openingHours: DataTypes.JSON
	}, {
		instanceMethods: {
			getPublicAttributes() {
				var output = {
					id: this.id,
					name: this.name,
					url: this.url,
					image: this.image,
					openingHours: this.openingHours,
					formattedOpeningHours: this.getPrettyOpeningHours(),
					latitude: this.latitude,
					longitude: this.longitude,
					address: this.address,
					distance: Math.round(this.distance * 1000)
				};

				if (this.Menus)
					output.Menus = this.Menus.map(m => m.getPublicAttributes());

				return output;
			},
			getPrettyOpeningHours() {
				return this.openingHours.reduce((hours, curr, i) => {
					const dayString = moment((i + 1) % 7, 'd').format('dd').toLowerCase();
					if (curr)
						hours[dayString] = formatHour(curr[0]) + ' - ' + formatHour(curr[1]);
					else
						hours[dayString] = 'closed';
					return hours;
				}, {});
			}
		},
		classMethods: {
			associate(models) {
				models.Restaurant.hasMany(models.Menu);
				models.Restaurant.belongsTo(models.Area);
			},
			getPublicAttributes() {
				return ['id', 'name', 'url', 'image', 'openingHours', 'latitude', 'longitude', 'address'];
			}
		}
	});
};
