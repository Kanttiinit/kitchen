var mongoose = require('mongoose');
var Menu = require('./Menu');

const Restaurant = mongoose.Schema({
	name: String,
	logo: String,
	location: {
		latitude: Number,
		longitude: Number
	},
	openingHours: [{
		day: String,
		hours: {start: Date, end: Date}
	}],
	menu: [Menu]
});

module.exports = Restaurant;