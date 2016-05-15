const models = require('./models');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/', require('./routers/api'));

app
.get('/help', (req, res) => {
	res.redirect('https://github.com/Kanttiinit/kanttiinit-backend/blob/master/README.md');
})
.get('/', (req, res) => {
	res.json({status: 'up'});
});

models.sequelize.sync().then(() => {
	const server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening at http://%s:%s', server.address().address, server.address().port);
	});
});
