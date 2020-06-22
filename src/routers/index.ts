import * as express from 'express';

import adminRouter from './admin';
import publicRouter from './public';
import graphql from './graphql';
import contact from './contact';
const { version } = require('../../package.json');

export default express
  .Router()
  .use('/graphql', graphql)
  .use('/admin', adminRouter)
  .use('/', publicRouter)
  .get('/help', (req, res) =>
    res.redirect('https://github.com/Kanttiinit/kitchen/blob/master/README.md')
  )
  .post('/contact', contact)
  .get('/', (req, res) => res.json({ version }))
  .get('*', (req, res, next) =>
    next({ code: 404, message: "Endpoint doesn't exist." })
  );
