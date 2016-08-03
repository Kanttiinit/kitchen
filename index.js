const models = require('./models');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app
.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json())
.use(cors())
.use(session({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: true,
	saveUninitialized: true
}))
.use((req, res, next) => {
	req.loggedIn = req.session.loggedIn;
	next();
})
.use((req, res, next) => {
	const acceptedLanguages = ['fi', 'en'];
	if (acceptedLanguages.indexOf(req.query.lang) > -1)
		req.lang = req.query.lang;
	else
		req.lang = 'fi';
	next();
})
.use('/admin', express.static('admin'))
.use('/admin', require('./routers/admin'))
.use('/', require('./routers/api'))
.get('/admin', (req, res) => {
	res.sendFile('./admin/index.html');
})
.get('/help', (req, res) => {
	res.redirect('https://github.com/Kanttiinit/kanttiinit-backend/blob/master/README.md');
})
.get('/', (req, res) => {
	res.json({status: 'up'});
})
.get('*', (req, res) => {
	res.status(404).json({message: 'enpoint does not exist'});
});

models.sequelize.sync().then(() => {
	const server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at http://%s:%s', server.address().address, server.address().port);
	});
});
