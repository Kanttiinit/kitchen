const request = require('supertest');
const app = require('../../dist').default;
const utils = require('../utils');

describe('/change', () => {
  beforeEach(async () => {
    await utils.syncDB();
  });

  afterAll(async () => {
    await app.locals.sessionStore.stopExpiringSessions();
    await utils.closeDB();
  });

  it('creating change works', async () => {
    const response = await request(app)
    .post('/changes')
    .set('Accept', 'application/json')
    .send({
      modelName: 'Restaurant',
      modelFilter: { id: 1 },
      change: { address: 'New address' }
    })
    .expect(200);
    expect(Object.keys(response.body)).toEqual(['uuid']);
    const changes = await utils.models.Change.findAll();
    expect(changes.length).toBe(1);
    expect(changes[0].change.address).toBe('New address');
  });

  it('returns accepted changes once', async () => {
    const agent = request.agent(app);
    await utils.createRestaurant(1);
    const createResponse = await agent
    .post('/changes')
    .set('Accept', 'application/json')
    .send({
      modelName: 'Restaurant',
      modelFilter: { id: 1 },
      change: { address: 'New address' }
    })
    .expect(200);
    let response = await agent.get(`/changes/${createResponse.body.uuid}`).expect(200);
    expect(response.body.change).toEqual({ address: 'New address' });
    expect(response.body.appliedAt).toEqual(null);
    const item = await utils.models.Change.findOne();
    await item.apply('Person');
    response = await agent.get(`/changes/${createResponse.body.uuid}`).expect(200);
    expect(response.body.change).toEqual({ address: 'New address' });
    expect(response.body.appliedAt).not.toEqual(null);
  });
});
