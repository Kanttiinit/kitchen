var mongoose = require('mongoose');

const Menu = mongoose.Schema({
	date: Date,
	courses: [{
		title: String,
		properties: [String]
	}]
});

module.exports = Menu;