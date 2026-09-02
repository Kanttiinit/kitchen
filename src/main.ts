import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

import * as environment from './environment.ts';
import denoJSON from '../deno.json' with { type: 'json' };

import router from './routers/index.ts';

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
  .route('/', router)
  .get('/', (c) => c.json({ version: denoJSON.version }))
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: true, message: err.message }, err.status);
    }
    console.error(err);
    return c.json({ error: true, message: 'Internal server error.' }, 500);
  })
  .notFound((c) => c.json({ error: true, message: 'Not found.', status: 404 }, 404));

Deno.serve({ port: Number(Deno.env.get('PORT')) || 3000 }, app.fetch);
