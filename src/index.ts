import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as session from 'express-session';
import * as SequelizeSession from 'connect-session-sequelize';
import * as ua from 'universal-analytics';
import * as Sentry from '@sentry/node';

import { sequelize } from './models';
import routers from './routers/';
import * as environment from './environment';

if (environment.isProduction) {
  if (!environment.sessionSecret) {
    throw new Error('SESSION_SECRET is required.');
  }

  if (!environment.origins) {
    throw new Error('ORIGINS is required.');
  }

  if (!environment.adminPassword) {
    throw new Error('ADMIN_PASSWORD is required');
  }
}

const app = express();

const cookieMaxAge = 1000 * 60 * 60 * 24 * 30;

const SessionStore = new SequelizeSession(session.Store);
const sessionStore = new SessionStore({
  db: sequelize,
  expiration: cookieMaxAge
});
app.locals.sessionStore = sessionStore;

Sentry.init({ dsn: environment.sentryDSN });

export default app
.use(Sentry.Handlers.requestHandler())
.use(
  cors({
    credentials: true,
    origin: environment.origins,
    unset: 'destroy'
  })
)
.use(
  session({
    secret: environment.sessionSecret,
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: {
      maxAge: cookieMaxAge
    }
  })
)
.use(ua.middleware(environment.universalAnalyticsId))
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
  if (err.code && err.code !== 500) {
    res.status(err.code).json(err);
  } else {
    next(err);
  }
})
.use(Sentry.Handlers.errorHandler())
.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: 'Server error.' });
});

if (!module.parent) {
  app.locals.adminPassword = environment.adminPassword;
  (async () => {
    try {
      await sequelize.sync();
      const server = app.listen(environment.port, () => {
        const address: any = server.address();
        console.log('Listening at http://%s:%s', address.address, address.port);
      });
    } catch (e) {
      console.error(e);
    }
  })();
}
