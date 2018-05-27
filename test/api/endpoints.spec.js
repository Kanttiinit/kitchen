const chai = require('chai');
const request = require('supertest');
const app = require('../../dist').default;

const {setUpModels, resetDB} = require('../utils');

const areaSchema = require('../../schema/area.json');
const restaurantSchema = require('../../schema/restaurant.json');
const favoriteSchema = require('../../schema/favorite.json');
const menuEndpointSchema = require('../../schema/menu-endpoint.json');

const {expect} = chai;
chai.use(require('chai-json-schema'));
chai.tv4.addSchema('restaurant.json', restaurantSchema);
chai.tv4.addSchema('menu.json', require('../../schema/menu.json'));

function generateListSchema(schema) {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'array',
    'items': schema
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

      expect(res.body).to.be.jsonSchema(schema);
      resolve();
    });
  });
}

describe('Data endpoints', function() {
  before(async () => {
    await setUpModels();
  });

  after(async () => {
    await resetDB();
  });

  it('basic schemas are ok', () => {
    const endpointSchemas = {
      '/menus?restaurants=1,2,3': menuEndpointSchema,
      '/areas': generateListSchema(areaSchema),
      '/restaurants': generateListSchema(restaurantSchema),
      '/favorites': generateListSchema(favoriteSchema)
    };

    return Promise.all(
      Object.keys(endpointSchemas)
      .map(key => validateEndpoint(key, endpointSchemas[key]))
    );
  });

  it('does not return hidden areas', async () => {
    const res = await request(app).get('/areas');
    expect(res.body.find(area => area.id === 3)).to.be.undefined;
  });

  it('does not return hidden restaurants', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.body.find(restaurant => restaurant.id === 3)).to.be.undefined;
  });

  describe('/restaurants/1/menu', function() {
    it('responds with json', () =>
      validateEndpoint('/restaurants/1/menu', restaurantSchema)
    );

    it('responds with html', () => 
      request(app)
      .get('/restaurants/1/menu.html')
      .expect(200)
      .expect('Content-Type', /text\/html/)
    );
  });
});
