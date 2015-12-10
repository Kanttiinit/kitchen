var models = require('./models');

models.sequelize.sync().then(() => {
	console.log(true);
});
