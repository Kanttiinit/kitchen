const request = require('supertest');
const app = require('../../dist').default;
const utils = require('../utils');

describe('/change', () => {
  beforeEach(async () => {
    await utils.syncDB();
  });

  afterEach(async () => {
    await app.locals.sessionStore.stopExpiringSessions();
  });

  it('creating change works', async () => {
    await request(app)
    .post('/changes')
    .send({
      modelName: 'Restaurant',
      modelFilter: { id: 1 },
      change: { address: 'New address' }
    })
    .expect(200);
    const changes = await utils.models.Change.findAll();
    expect(changes.length).toBe(1);
    expect(changes[0].change.address).toBe('New address');
  });

  it('always returns something from accepted endpoint', async () => {
    const response = await request(app)
    .get('/changes/accepted')
    .expect(200);
    expect(response.body).toEqual([]);
  });

  it('returns accepted changes once', async () => {
    const agent = request.agent(app);
    await utils.createRestaurant(1);
    await agent
    .post('/changes')
    .send({
      modelName: 'Restaurant',
      modelFilter: { id: 1 },
      change: { address: 'New address' }
    })
    .expect(200);
    let response = await agent.get('/changes/accepted').expect(200);
    expect(response.body).toEqual([]);
    const item = await utils.models.Change.findOne();
    await item.apply('Person');
    response = await agent.get('/changes/accepted').expect(200);
    expect(response.body[0].change).toEqual({ address: 'New address' });
    response = await agent.get('/changes/accepted').expect(200);
    expect(response.body).toEqual([]);
  });
});
