const request = require('supertest');
const app = require('../dist/').default;

const password = 'password';
app.locals.adminPassword = password;

describe('Admin functionality', () => {
  describe('before logging in', () => {
    test('can not read logged in state', async () => {
      await request(app)
      .get('/admin/logged-in')
      .expect(401);
    });
  });

  describe('logging in', () => {
    test('returns message when already logged in', async () => {
      const agent = request.agent(app);
      await agent.post('/admin/login').send({ password });

      const response = await agent
      .post('/admin/login')
      .send({ password: 'anything' })
      .expect(200);
      expect(response.body.message).toBe('Already logged in.');
    });

    test('returns message when logging in with correct password', async () => {
      const response = await request(app)
      .post('/admin/login')
      .send({ password })
      .expect(200);
      expect(response.body.message).toBe('Logged in.');
    });

    test('returns message when logging in with wrong password', async () => {
      const response = await request(app)
      .post('/admin/login')
      .send({ password: 'wrong-password' })
      .expect(401);
      expect(response.body.message).toBe('Wrong password.');
    });
  });

  describe('once logged in', () => {
    let agent;
    beforeEach(async () => {
      agent = request.agent(app);
      await agent.post('/admin/login').send({ password });
    });

    test('state is correct', async () => {
      const response = await agent.get('/admin/logged-in');
      expect(response.body.message).toBe('Yes.');
    });

    test('can log out', async () => {
      await agent.post('/admin/logout');
      await agent.get('/admin/logged-in').expect(401);
    });
  });
});
