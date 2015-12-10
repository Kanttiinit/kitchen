var mongoose = require('mongoose');
var AreaSchema = require('./schema/Area.js');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	const Area = mongoose.model('Area', AreaSchema);
	area = new Area({name: 'asd'});
	area.save();
	console.log('yes');
});