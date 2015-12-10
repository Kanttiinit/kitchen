var mongoose = require('mongoose');
var Restaurant = require('./Restaurant');

const Area = mongoose.Schema({
	name: String,
	logo: String,
	location: {
		latitude: Number,
		longitude: Number
	},
	locationRadius: Number,
	restaurants: [Restaurant]
});

module.exports = Area;
