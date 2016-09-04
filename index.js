const models = require('./models');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const package = require('./package.json');
const passport = require('passport');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
	throw new Error('SESSION_SECRET is required');
}

app
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended: false}))
.use(compression())
.use(cors())
.use(session({
	secret: sessionSecret,
	store: new SequelizeStore({db: models.sequelize}),
	proxy: true
}))
.use(passport.initialize())
.use(passport.session())
.use((req, res, next) => {
	if (['fi', 'en'].includes(req.query.lang))
		req.lang = req.query.lang;
	else
		req.lang = 'fi';
	next();
})
.use('/admin', require('./routers/admin'))
.use('/auth', require('./routers/auth'))
.use('/', require('./routers/api'))
.get('/help', (req, res) =>
	res.redirect('https://github.com/Kanttiinit/kanttiinit-backend/blob/api-v2/README.md'))
.get('/', (req, res) => res.json({version: package.version}))
.get('*', (req, res) => res.status(404).json({message: 'endpoint does not exist'}));

models.sequelize.sync().then(() => {
	const server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at http://%s:%s', server.address().address, server.address().port);
	});
});
