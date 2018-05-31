const request = require('supertest');
const app = require('../dist').default;
const {
  validateRestaurant,
  validateArea,
  validateFavorite,
  validateMenuEndpoint
} = require('./validateSchema');

const {
  createArea,
  createRestaurant,
  createFavorite,
  syncDB
} = require('./utils');

const get = endpoint =>
  request(app)
  .get(endpoint)
  .expect(200);

describe.only('Data endpoints', function() {
  beforeAll(async () => {
    await syncDB();
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
    await Promise.all([
      createFavorite(1),
      createFavorite(2),
      createFavorite(3)
    ]);
  });

  test('restaurant endpoint returns correct data', async () => {
    const response = await get('/restaurants');
    expect(validateRestaurant(response.body, true)).toBe(true);
  });

  test('area endpoint returns correct data', async () => {
    const response = await get('/areas');
    expect(validateArea(response.body, true)).toBe(true);
  });

  test('favorites endpoint returns correct data', async () => {
    const response = await get('/favorites');
    expect(validateFavorite(response.body, true)).toBe(true);
  });

  test('menu endpoint returns correct data', async () => {
    const response = await get('/menus?restaurants=1,2,3');
    expect(validateMenuEndpoint(response.body)).toBe(true);
  });

  test('does not return hidden areas', async () => {
    const res = await request(app).get('/areas');
    expect(res.body.find(area => area.id === 3)).toBeUndefined();
  });

  test('does not return hidden restaurants', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.body.find(restaurant => restaurant.id === 3)).toBeUndefined();
  });

  test('restaurant-specific menu endpoint returns correct data', async () => {
    const response = await get('/restaurants/1/menu');
    expect(validateRestaurant(response.body)).toBe(true);
  });
});
