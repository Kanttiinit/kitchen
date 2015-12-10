const models = require('./models');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
}))

app.use('/admin', express.static('admin'));

app.get('/admin', (req, res) => {
	res.sendFile('./admin/index.html');
})
.get('/login', (req, res) => {
	res.json({loggedIn: false});
})
.post('/login', (req, res) => {
	if (req.body.password === 'max')
		res.json({loggedIn: true});
})
.get('/', (req, res) => {
	res.send('asd');
});

models.sequelize.sync().then(() => {
	const server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at http://%s:%s', server.address().address, server.address().port);
	});
});
