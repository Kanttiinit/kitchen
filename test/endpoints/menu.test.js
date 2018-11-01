const request = require('supertest');
const app = require('../../dist').default;
const utils = require('../utils');
const moment = require('moment');

describe('/menu', () => {
  beforeAll(async () => {
    await utils.syncDB();
    await utils.createArea(1);
    await utils.createArea(2);
    await utils.createRestaurant(1, { AreaId: 1 });
    await utils.createRestaurant(2, { AreaId: 1 });
    await utils.createRestaurant(3, { AreaId: 2 });
    await utils.createMenu(1, { day: moment('2018-06-01'), RestaurantId: 1 });
    await utils.createMenu(2, { day: moment('2018-06-02'), RestaurantId: 1 });
    await utils.createMenu(3, { day: moment('2018-06-03'), RestaurantId: 1 });
    await utils.createMenu(4, { day: moment('2018-06-01'), RestaurantId: 2 });
    await utils.createMenu(5, { day: moment('2018-06-03'), RestaurantId: 2 });
    await utils.createMenu(6, { day: moment('2018-06-01'), RestaurantId: 3 });
  });

  afterAll(async () => {
    await app.locals.sessionStore.stopExpiringSessions();
    await utils.closeDB();
  });

  it('filters menus based on restaurant ids', async () => {
    const response = await request(app)
    .get('/menus?restaurants=1,3&days=2018-06-01')
    .expect(200);
    expect(Object.keys(response.body).sort()).toEqual(['1', '3']);
  });

  it('filters menus based on area ids', async () => {
    const response = await request(app)
    .get('/menus?areas=1&days=2018-06-01')
    .expect(200);
    expect(Object.keys(response.body).sort()).toEqual(['1', '2']);
  });

  it('filters menus based on days', async () => {
    const response = await request(app)
    .get('/menus?areas=1&days=2018-06-02,2018-06-03')
    .expect(200);
    expect(Object.keys(response.body['1'])).toEqual([
      '2018-06-02',
      '2018-06-03'
    ]);
    expect(Object.keys(response.body['2'])).toEqual(['2018-06-03']);
    expect(response.body['3']).toBeUndefined();
  });

  it('respects the language', async () => {
    const responseEn = await request(app)
    .get('/menus?lang=en&days=2018-06-01')
    .expect(200);
    expect(responseEn.body['1']['2018-06-01'][0].title).toEqual('Food 1');
    const responseFi = await request(app)
    .get('/menus?lang=fi&days=2018-06-01')
    .expect(200);
    expect(responseFi.body['1']['2018-06-01'][0].title).toEqual('Ruoka 1');
  });
});
