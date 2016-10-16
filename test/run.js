import models from '../src/models';
import _ from 'lodash';
import {spawn} from 'child_process';
import Mocha from 'mocha';

if (!process.env.FB_TOKEN) {
  console.log('Please define a Facebook access token in the environment under FB_TOKEN.\nYou can get on here https://developers.facebook.com/tools/explorer/');
  process.exit(1);
}

function createArea(id, fields) {
  return models.Area.create({
    id,
    name_i18n: {fi: `Alue ${id}`, en: `Area ${id}`},
    locationRadius: _.random(1, 2, true),
    latitude: 60.123,
    longitude: 24.123,
    ...fields
  });
}

function createRestaurant(id, fields) {
  return models.Restaurant.create({
    id,
    name_i18n: {fi: `Ravintola ${id}`, en: `Restaurant ${id}`},
    url: 'https://restaurant.fi/',
    menuURL: 'https://restaurant.fi/menu.json',
    latitude: 60.123,
    longitude: 24.123,
    address: 'Address',
    openingHours: [[1030, 1500], [1030, 1500], [1030, 1500], [1030, 1500], [1030, 1400], null, null],
    ...fields
  });
}

function createFavorite(id) {
  return models.Favorite.create({
    name_i18n: {fi: `Suosikki ${id}`, en: `Favorites ${id}`},
    regexp: `suosikki ${id}`
  });
}

function setUpModels() {
  console.log('Setting up models...');
  return models.sequelize.sync({force: true})
  .then(() =>
    Promise.all([
      createArea(1),
      createArea(2),
      createArea(3, {hidden: true})
    ])
  )
  .then(() =>
    Promise.all([
      createRestaurant(1, {AreaId: 1}),
      createRestaurant(2, {AreaId: 2}),
      createRestaurant(3, {AreaId: 2, hidden: true})
    ])
  )
  .then(() =>
    Promise.all([createFavorite(1), createFavorite(2), createFavorite(3)])
  );
}

function spawnServer() {
  console.log('Spawning server...');
  const serverProcess = spawn('npm', ['run', 'serve']);
  serverProcess.stderr.pipe(process.stderr);
  return new Promise(resolve => {
    serverProcess.stdout.on('data', data => {
      if (data.toString().match(/Listening at .+/)) {
        resolve(serverProcess);
      }
    });
  });
}

function runTests(serverProcess) {
  const mocha = new Mocha();
  mocha.addFile(__dirname + '/api/endpoints.spec.js');
  mocha.addFile(__dirname + '/api/user.spec.js');
  mocha.addFile(__dirname + '/parsers.spec.js');
  mocha.run(err => {
    serverProcess.kill();
    process.exit(err);
  });
}

setUpModels()
.then(spawnServer)
.then(runTests);
