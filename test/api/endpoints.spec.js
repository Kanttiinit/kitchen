import chai, {expect} from 'chai';
const request = require('supertest');

const areaSchema = require('../../schema/area.json');
const restaurantSchema = require('../../schema/restaurant.json');
const favoriteSchema = require('../../schema/favorite.json');
const menuEndpointSchema = require('../../schema/menu-endpoint.json');

chai.use(require('chai-json-schema'));
chai.tv4.addSchema('restaurant.json', restaurantSchema);
chai.tv4.addSchema('menu.json', require('../../schema/menu.json'));

const baseRequest = request('http://localhost:3000');

function generateListSchema(schema) {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'array',
    'items': schema
  };
}

function validateEndpoint(endpoint, schema) {
  return new Promise((resolve, reject) => {
    baseRequest
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

  it('does not return hidden areas', done => {
    baseRequest
    .get('/areas')
    .end((err, res) => {
      expect(res.body.find(area => area.id === 3)).to.be.undefined;
      done();
    });
  });

  it('does not return hidden restaurants', done => {
    baseRequest
    .get('/restaurants')
    .end((err, res) => {
      expect(res.body.find(restaurant => restaurant.id === 3)).to.be.undefined;
      done();
    });
  });

  describe('/restaurants/1/menu', function() {
    it('responds with json', () =>
      validateEndpoint('/restaurants/1/menu', restaurantSchema)
    );

    it('responds with html', done => {
      baseRequest
      .get('/restaurants/1/menu.html')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .end(done);
    });

    it('responds with image', done => {
      this.timeout(15000);
      baseRequest
      .get('/restaurants/1/menu.png')
      .expect(302)
      .expect('Location', /amazonaws\.com/)
      .end(done);
    });
  });
});
