const request = require('supertest');
const app = require('../../dist').default;
const utils = require('../utils');
const { telegram } = require('../../dist/routers/changeRouter');

jest.mock('telegraf', () => ({
  default: class {
    constructor() {
      this.on = jest.fn();
      this.startPolling = jest.fn();
    }
  }
}));
jest.mock('telegraf/telegram', () => class {
  constructor() {
    this.sendMessage = jest.fn().mockResolvedValue();
  }
});

describe('/change', () => {
  beforeEach(async () => {
    await utils.syncDB();
  });

  afterAll(async () => {
    await app.locals.sessionStore.stopExpiringSessions();
    await utils.closeDB();
  });

  it('creating change works', async () => {
    await utils.createRestaurant(1);
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

  it('returns change by uuid', async () => {
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
    expect(response.body[0].change).toEqual({ address: 'New address' });
    expect(response.body[0].appliedAt).toEqual(null);
  });

  describe('telegram', () => {
    it('sends a message when creating a change', async () => {
      await utils.createRestaurant(1);
      await request(app)
      .post('/changes')
      .send({
        modelName: 'Restaurant',
        modelFilter: { id: 1 },
        change: { address: 'New address' }
      });
      expect(telegram.sendMessage).toHaveBeenCalled();
      const {calls} = telegram.sendMessage.mock;
      expect(typeof calls[0][0]).toEqual('number');
      expect(calls[0][1]).toContain('Change requested');
    });
  });
});
