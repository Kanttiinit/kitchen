import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

import * as environment from './environment.ts';
import denoJSON from '../deno.json' with { type: 'json' };

import dataRouter from './routers/index.ts';
import contactRouter from './routers/contact.ts';

if (environment.isProduction) {
  if (!environment.origins) {
    throw new Error('ORIGINS is required.');
  }
}

const app = new Hono();

app
  .use(
    '*',
    cors({
      credentials: true,
      origin: environment.origins,
    }),
  )
  // .use('/graphql', graphql)
  .route('/', dataRouter)
  .get('/help', (c) => c.redirect('https://github.com/Kanttiinit/kitchen'))
  .route('/contact', contactRouter)
  .get('/', (c) => c.json({ version: denoJSON.version }))
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: true, message: err.message, status: err.status }, err.status);
    }
    console.error(err);
    return c.json({ error: true }, 500);
  })
  .notFound((c) => c.json({ error: true, message: 'Not found.', status: 404 }, 404));

Deno.serve({ port: Number(Deno.env.get('PORT')) || 3000 }, app.fetch);
