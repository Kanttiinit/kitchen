import Sequelize from 'sequelize';


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: process.env.SEQUELIZE_LOGGING ? console.log : false
});

const models = {sequelize};

['Area', 'Favorite', 'Menu', 'Restaurant', 'User']
.forEach(file => {
  const model = sequelize.import(__dirname + '/' + file);
  models[model.name] = model;
});

models.Area.hasMany(models.Restaurant);
models.Menu.belongsTo(models.Restaurant);
models.Restaurant.hasMany(models.Menu);
models.Restaurant.belongsTo(models.Area);

export default models;
