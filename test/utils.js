const models = require('../dist/models');

function createArea(id, fields) {
  return models.Area.create({
    id,
    name_i18n: { fi: `Alue ${id}`, en: `Area ${id}` },
    locationRadius: 2,
    latitude: 60.123,
    longitude: 24.123,
    ...fields
  });
}

function createRestaurant(id, fields) {
  return models.Restaurant.create({
    id,
    name_i18n: { fi: `Ravintola ${id}`, en: `Restaurant ${id}` },
    url: 'https://restaurant.fi/',
    menuURL: 'https://restaurant.fi/menu.json',
    latitude: 60.123,
    longitude: 24.123,
    address: 'Address',
    openingHours: [
      [1030, 1500],
      [1030, 1500],
      [1030, 1500],
      [1030, 1500],
      [1030, 1400],
      null,
      null
    ],
    ...fields
  });
}

function createFavorite(id) {
  return models.Favorite.create({
    name_i18n: { fi: `Suosikki ${id}`, en: `Favorites ${id}` },
    regexp: `suosikki ${id}`
  });
}

async function resetDB() {
  await models.sequelize.sync({ force: true, match: /_test$/ });
}

async function setUpModels() {
  console.log('Setting up models...');
  await resetDB();
  await Promise.all([
    createArea(1),
    createArea(2),
    createArea(3, { hidden: true })
  ]);
  await Promise.all([
    createRestaurant(1, { AreaId: 1 }),
    createRestaurant(2, { AreaId: 2 }),
    createRestaurant(3, { AreaId: 2, hidden: true })
  ]);
  await Promise.all([createFavorite(1), createFavorite(2), createFavorite(3)]);
}

module.exports = {setUpModels, resetDB};