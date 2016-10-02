import models from './models';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {version} from '../package.json';
import session from 'express-session';
import {Store} from 'connect-session-sequelize';

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET is required');
}

import adminRouter from './routers/admin';
import apiRouter from './routers/api';
import meRouter from './routers/me';

app
.use(cors({
  credentials: true
}))
.use(session({
  secret: process.env.SESSION_SECRET,
  saveUnitialized: false,
  resave: false,
  store: new Store({db: models.sequelize})
}))
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended: false}))
.use('/admin', adminRouter)
.use('/me', meRouter)
.use('/', apiRouter)
.get('/help', (req, res) =>
  res.redirect('https://github.com/Kanttiinit/kanttiinit-backend/blob/api-v2/README.md'))
.get('/', (req, res) => res.json({version}))
.get('*', (req, res, next) => next({code: 404, message: 'Endpoint doesn\'t exist.'}))
.use((err, req, res) => res.status(err.code).json(err));

models.sequelize.sync().then(() => {
  const server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening at http://%s:%s', server.address().address, server.address().port);
  });
});
