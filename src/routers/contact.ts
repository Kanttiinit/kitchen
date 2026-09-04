import { Hono, MiddlewareHandler } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import telegraf from 'telegraf';

import * as environment from '../environment.ts';
import { HTTPException } from 'hono/http-exception';

const chatId = environment.telegramFeedbackChatId || '';
const botToken = environment.telegramBotToken || '';
const telegram = new telegraf.Telegram(botToken);

export default new Hono()
  .use(rateLimiter({
    // 3 requests in 15 mins
    windowMs: 15 * 60 * 1000,
    limit: 3,
    keyGenerator: (c) =>
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      '',
  }) as unknown as MiddlewareHandler)
  .post('/', async (c) => {
    const { email = 'anonymous', message } = await c.req.json();

    if (email.trim() !== '' && message.trim() !== '') {
      try {
        await telegram.sendMessage(
          chatId,
          `New feedback from ${email}:\n"${message}"`,
        );
        return c.json({ message: 'Success.' });
      } catch (err: unknown) {
        throw new HTTPException(500, { message: err instanceof Error ? err.message : 'Unknown error.' });
      }
    } else {
      throw new HTTPException(400, { message: 'Bad request.' });
    }
  });
