import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as session from 'express-session';
import * as SequelizeSession from 'connect-session-sequelize';
import * as ua from 'universal-analytics';

import { sequelize } from './models';
import routers from './routers/';

const app = express();

const SessionStore = SequelizeSession(session.Store);
const sessionSecret = process.env.SESSION_SECRET;
const origins = process.env.ORIGINS;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET is required.');
}

if (!origins) {
  throw new Error('ORIGINS is required.');
}

export default app
  .use(
    cors({
      credentials: true,
      origin: origins.split(','),
      unset: 'destroy'
    })
  )
  .use(
    session({
      secret: sessionSecret,
      saveUninitialized: false,
      resave: false,
      store: new SessionStore({ db: sequelize })
    })
  )
  .use(ua.middleware(process.env.UA_ID))
  .use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      (req as any).visitor
        .timing('Request finished', req.url, duration)
        .pageview(req.url)
        .send();
    });
    next();
  })
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(routers)
  .use((err, req, res, next) => {
    if (err.code) {
      res.status(err.code).json(err);
    } else {
      console.error(err);
      res.status(500).json({ code: 500, message: 'Server error.' });
    }
  });

if (!module.parent) {
  app.locals.adminPassword = process.env.ADMIN_PASSWORD;
  (async () => {
    await sequelize.sync();
    const server = app.listen(process.env.PORT || 3000, () => {
      const address: any = server.address();
      console.log('Listening at http://%s:%s', address.address, address.port);
    });
  })();
}
