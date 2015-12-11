const models = require('./models');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: true,
	saveUninitialized: true
}))

app.use('/admin', express.static('admin'));

app.use('/admin', require('./routers/admin.js'));
app.use('/api', require('./routers/api.js'));

app.get('/admin', (req, res) => {
	res.sendFile('./admin/index.html');
})
.get('/', (req, res) => {
	res.send('kanttiinit.fi');
});

models.sequelize.sync().then(() => {
	const server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at http://%s:%s', server.address().address, server.address().port);
	});
});
