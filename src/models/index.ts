import Sequelize from 'sequelize';
import Area from './Area';
import Favorite from './Favorite';
import Menu from './Menu';
import Restaurant from './Restaurant';
import User from './User';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: process.env.SEQUELIZE_LOGGING ? console.log : false
});

Area.hasMany(Restaurant);
Menu.belongsTo(Restaurant);
Restaurant.hasMany(Menu);
Restaurant.belongsTo(Area);

const models = {
  Area,
  Favorite,
  Menu,
  Restaurant,
  User
};

export default models;
