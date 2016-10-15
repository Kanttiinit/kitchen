const chai = require('chai');
const request = require('supertest');

const areaSchema = require('../schema/area.json');
const restaurantSchema = require('../schema/restaurant.json');
const favoriteSchema = require('../schema/favorite.json');
const menuEndpointSchema = require('../schema/menu-endpoint.json');

chai.use(require('chai-json-schema'));
chai.tv4.addSchema('restaurant.json', restaurantSchema);
chai.tv4.addSchema('menu.json', require('../schema/menu.json'));

const expect = chai.expect;
const baseRequest = request('http://localhost:3000');

function generateListSchema(schema) {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'array',
    'items': schema
  };
}

function basicRequest(endpoint, statusCode = 200) {
  return new Promise((resolve, reject) => {
    baseRequest
    .get(endpoint)
    .expect(statusCode)
    .end(function(err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

function validateEndpoint(endpoint, schema) {
  return basicRequest(endpoint)
  .then(res =>
    expect(JSON.parse(res.text)).to.be.jsonSchema(schema)
  );
}

describe('Data endpoints', function() {
  describe('/menus', function() {
    it('is correctly formed', () =>
      validateEndpoint('/menus?restaurants=1,2,3', menuEndpointSchema)
    );
  });

  describe('/areas', function() {
    it('is correctly formed', () =>
      validateEndpoint('/areas', generateListSchema(areaSchema))
    );
  });

  describe('/restaurants', function() {
    it('is correctly formed', () =>
      validateEndpoint('/restaurants', generateListSchema(restaurantSchema))
    );
  });

  describe('/favorites', function() {
    it('is correctly formed', () =>
      validateEndpoint('/favorites', generateListSchema(favoriteSchema))
    );
  });

  describe('/restaurants/1/menu', function() {
    it('responds with json', () =>
      validateEndpoint('/restaurants/1/menu', restaurantSchema)
    );

    it('responds with html', () =>
      basicRequest('/restaurants/1/menu.html')
      .then(res => {
        expect(res.headers['content-type']).to.match(/text\/html/);
      })
    );

    it('responds with image', function() {
      this.timeout(15000);
      return basicRequest('/restaurants/1/menu.png', 302)
      .then(res => {
        expect(res.headers['location']).to.match(/amazonaws\.com/);
      });
    });
  });
});

describe('User', () => {
  let cookie;
  function userRequest(endpoint) {
    return baseRequest.get(endpoint).set('Cookie', cookie);
  }

  describe('logging in', () => {
    it('returns unknown provider with no access token', done => {
      baseRequest.post('/me/login').expect(400).end(done);
    });

    it('returns authorization error with incorrect Facebook access token', done => {
      baseRequest
      .post('/me/login')
      .send({provider: 'facebook', token: 'incorrecttoken'})
      .expect(403)
      .end(done);
    });

    it('works with correct Facebook access token', done => {
      baseRequest
      .post('/me/login')
      .send({provider: 'facebook', token: process.env.FB_TOKEN})
      .expect('Set-Cookie', /sid=/)
      .expect(200)
      .end((err, res) => {
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('fetching data', () => {
    it('fetches data with returned session id', done => {
      userRequest('/me')
      .expect(200)
      .end(done);
    });

    it('can not fetch admin data', done => {
      userRequest('/admin/areas')
      .expect(401)
      .end(done);
    });
  });

  describe('editing preferences', () => {
    it('saves allowed key', done => {
      baseRequest
      .put('/me/preferences')
      .send({useLocation: true})
      .set('Cookie', cookie)
      .expect(200)
      .end(() => {
        userRequest('/me')
        .end((err, res) => {
          expect(res.body.preferences.useLocation).to.be.true;
          done();
        });
      });
    });

    it('does not save unallowed key', done => {
      baseRequest
      .put('/me/preferences')
      .send({thisKeyDoesNotExist: true})
      .set('Cookie', cookie)
      .expect(400)
      .end(() => {
        userRequest('/me')
        .end((err, res) => {
          expect(res.body.preferences.thisKeyDoesNotExist).to.be.undefined;
          done();
        });
      });
    });
  });

  describe('logging out', () => {
    it('logs out succesfully', done => {
      userRequest('/me/logout')
      .expect(200)
      .end(() => {
        userRequest('/me')
        .expect(401)
        .end(done);
      });
    });
  });

});
