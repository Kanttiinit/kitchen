import {expect} from 'chai';
const request = require('supertest');

const baseRequest = request('http://localhost:3000');

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
    it('saves allowed keys', done => {
      baseRequest
      .put('/me/preferences')
      .send({useLocation: true, selectedArea: 5})
      .set('Cookie', cookie)
      .expect(200)
      .end(() => {
        userRequest('/me')
        .end((err, res) => {
          expect(res.body.preferences).to.deep.equal({
            selectedArea: 5, useLocation: true
          });
          done();
        });
      });
    });

    it('merges keys', done => {
      baseRequest
      .put('/me/preferences')
      .send({selectedArea: 2, favorites: [1,2,3]})
      .set('Cookie', cookie)
      .expect(200)
      .end(() => {
        userRequest('/me')
        .end((err, res) => {
          expect(res.body.preferences).to.deep.equal({
            selectedArea: 2, useLocation: true, favorites: [1,2,3]
          });
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
