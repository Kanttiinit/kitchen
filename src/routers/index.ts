import * as express from 'express';

import adminRouter from './admin';
import publicRouter from './public';
const { version } = require('../../package.json');

export default express
  .Router()
  .use('/admin', adminRouter)
  .use('/', publicRouter)
  .get('/help', (req, res) =>
    res.redirect('https://github.com/Kanttiinit/kitchen/blob/master/README.md')
  )
  .get('/', (req, res) => res.json({ version }))
  .get('*', (req, res, next) =>
    next({ code: 404, message: "Endpoint doesn't exist." })
  );
