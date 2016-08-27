const models = require('./models');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const package = require('./package.json');

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
	throw new Error('SESSION_SECRET is required');
}

app
.use(compression())
.use(bodyParser.urlencoded({extended: false}))
.use(bodyParser.json())
.use(cors())
.use(session({
	secret: sessionSecret,
	resave: true,
	saveUninitialized: true
}))
.use((req, res, next) => {
	req.loggedIn = req.session.loggedIn;
	next();
})
.use((req, res, next) => {
	if (['fi', 'en'].includes(req.query.lang))
		req.lang = req.query.lang;
	else
		req.lang = 'fi';
	next();
})
.use('/admin', require('./routers/admin'))
.use('/', require('./routers/api'))
.get('/help', (req, res) => {
	res.redirect('https://github.com/Kanttiinit/kanttiinit-backend/blob/api-v2/README.md');
})
.get('/', (req, res) => res.json({version: package.version}))
.get('*', (req, res) => res.status(404).json({message: 'endpoint does not exist'}));

models.sequelize.sync().then(() => {
	const server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at http://%s:%s', server.address().address, server.address().port);
	});
});
