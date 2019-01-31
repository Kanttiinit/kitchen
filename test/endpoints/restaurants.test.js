const request = require('supertest');
const app = require('../../dist').default;
const utils = require('../utils');

describe('/restaurants', () => {
  beforeAll(async () => {
    await utils.syncDB();
    await utils.createArea(1, { name_i18n: { fi: 'Area', en: '' } });
    await utils.createArea(2, { name_i18n: { fi: '', en: '' } });
    await utils.createRestaurant(1, { AreaId: 1 });
    await utils.createRestaurant(2, { AreaId: 2 });
    await utils.createRestaurant(3, { AreaId: 2 });
    await utils.createRestaurant(15, {
      hidden: true,
      AreaId: 1,
      name_i18n: { fi: 'Query', en: '' },
      latitude: 61.967783,
      longitude: 25.248057
    });
    await utils.createRestaurant(4, {
      name_i18n: { fi: 'Query', en: '' },
      AreaId: 1
    });
    await utils.createRestaurant(5, {
      name_i18n: { fi: '', en: 'Something else' },
      latitude: 61.967783,
      longitude: 25.248057,
      AreaId: 2
    });
    await utils.createRestaurant(6, {
      name_i18n: { fi: '', en: 'Query' },
      AreaId: 2
    });
  });
  afterAll(async () => {
    await app.locals.sessionStore.stopExpiringSessions();
    await utils.closeDB();
  });

  it('returns all restaurants without ids', async () => {
    const response = await request(app)
    .get('/restaurants')
    .expect(200);
    expect(response.body.length).toEqual(6);
  });

  it('returns restaurants by ids', async () => {
    const response = await request(app)
    .get('/restaurants?ids=1,3,10,15')
    .expect(200);
    expect(response.body.length).toEqual(2);
    expect(response.body.map(r => r.id).sort()).toEqual([1, 3]);
  });

  it('returns restaurants by querying restaurant name', async () => {
    const response = await request(app)
    .get('/restaurants?query=query')
    .expect(200);
    expect(response.body.length).toEqual(2);
    expect(response.body.map(r => r.id).sort()).toEqual([4, 6]);
  });

  it('returns restaurants by querying area name', async () => {
    const response = await request(app)
    .get('/restaurants?query=area')
    .expect(200);
    expect(response.body.length).toEqual(2);
    expect(response.body.map(r => r.id).sort()).toEqual([1, 4]);
  });

  it('returns restaurants by location that are within distance', async () => {
    const response = await request(app)
    .get('/restaurants?location=61.9697625,25.2341173&distance=1000')
    .expect(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].id).toEqual(5);
  });

  it('does not return restaurants by location that are outside of distance', async () => {
    const response = await request(app)
    .get('/restaurants?location=61.971115,25.216196&distance=1000')
    .expect(200);
    expect(response.body.length).toEqual(0);
  });
});
