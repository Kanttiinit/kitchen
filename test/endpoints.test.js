const request = require('supertest');
const app = require('../dist').default;
const { matchers } = require('jest-json-schema');

expect.extend(matchers);

const {
  createArea,
  createRestaurant,
  createFavorite,
  syncDB
} = require('./utils');

const areaSchema = require('../schema/area.json');
const restaurantSchema = require('../schema/restaurant.json');
const favoriteSchema = require('../schema/favorite.json');
const menuEndpointSchema = require('../schema/menu-endpoint.json');

function generateListSchema(schema) {
  return {
    $schema: 'http://json-schema.org/draft-04/schema',
    type: 'array',
    items: schema
  };
}

function validateEndpoint(endpoint, schema) {
  return new Promise((resolve, reject) => {
    request(app)
    .get(endpoint)
    .expect(200)
    .end(function(err, res) {
      if (err) {
        return reject(err);
      }

      expect(res.body).toMatchSchema(schema);
      resolve();
    });
  });
}

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

  it.skip('basic schemas are ok', () => {
    const endpointSchemas = {
      '/menus?restaurants=1,2,3': menuEndpointSchema,
      '/areas': generateListSchema(areaSchema),
      '/restaurants': generateListSchema(restaurantSchema),
      '/favorites': generateListSchema(favoriteSchema)
    };

    return Promise.all(
      Object.keys(endpointSchemas).map(key =>
        validateEndpoint(key, endpointSchemas[key])
      )
    );
  });

  it('does not return hidden areas', async () => {
    const res = await request(app).get('/areas');
    expect(res.body.find(area => area.id === 3)).toBeUndefined();
  });

  it('does not return hidden restaurants', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.body.find(restaurant => restaurant.id === 3)).toBeUndefined();
  });

  it.skip('menu endpoint responds with json', () =>
    validateEndpoint('/restaurants/1/menu', restaurantSchema));
});
