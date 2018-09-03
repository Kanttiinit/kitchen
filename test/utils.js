require('dotenv').config();
const models = require('../dist/models');
const moment = require('moment');

const destroy = (...models) =>
  Promise.all(models.map(model => model.destroy()));

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

const createOpeningHour = (fields, offset = 0, duration = 7) => {
  const from = moment('2018-01-01').add({ days: offset });
  return models.OpeningHour.create({
    from: from.format('YYYY-MM-DD'),
    to:
      fields.to === null
        ? undefined
        : from
        .clone()
        .add({ days: duration })
        .format('YYYY-MM-DD'),
    opens: '10:00',
    closes: '18:00',
    manualEntry: true,
    dayOfWeek: 0,
    RestaurantId: 1,
    ...fields
  });
};

const createChange = fields => {
  return models.Change.create({
    ...fields
  });
};

async function syncDB() {
  await models.sequelize.sync({ force: true, match: /_test$/ });
}

module.exports = {
  syncDB,
  models,
  createRestaurant,
  createOpeningHour,
  destroy,
  createArea,
  createFavorite,
  createChange
};
