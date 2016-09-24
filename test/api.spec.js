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

function generateListSchema(schema) {
   return {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "array",
      "items": schema
   };
}

function basicRequest(endpoint, statusCode = 200) {
   return new Promise((resolve, reject) => {
      request('http://localhost:3000')
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

describe('API', function() {
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
         this.timeout(5000);
         return basicRequest('/restaurants/1/menu.png', 302)
         .then(res => {
            expect(res.headers['location']).to.match(/amazonaws\.com/);
         });
      });
   });
});
