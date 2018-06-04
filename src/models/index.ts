import * as Sequelize from 'sequelize';
import createArea from './Area';
import createFavorite from './Favorite';
import createMenu from './Menu';
import createRestaurant from './Restaurant';
import createUser from './User';
import createUpdate from './Update';
import createOpeningHour from './OpeningHour';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: Number(process.env.SEQUELIZE_LOGGING) ? console.log : false
});

export const Area = createArea(sequelize, Sequelize);
export const Favorite = createFavorite(sequelize, Sequelize);
export const Menu = createMenu(sequelize, Sequelize);
export const Restaurant = createRestaurant(sequelize, Sequelize);
export const User = createUser(sequelize, Sequelize);
export const Update = createUpdate(sequelize, Sequelize);
export const OpeningHour = createOpeningHour(sequelize, Sequelize);

Area.hasMany(Restaurant);
Menu.belongsTo(Restaurant);
Restaurant.hasMany(Menu);
Restaurant.belongsTo(Area);
OpeningHour.belongsTo(Restaurant);
