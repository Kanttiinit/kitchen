import { Hono, MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { rateLimiter } from 'hono-rate-limiter';
import Telegraf from 'telegraf';
import moment from 'moment';
import { parse, stringify } from '@std/yaml';
import z from 'zod';
import { sql } from 'kysely';

import * as environment from '../environment.ts';
import { db } from '../db.ts';
import { openingHoursSchema, restaurants, restaurantSchema } from '../../data/data.ts';
import { formatHours } from '../utils.ts';

const chatId = environment.telegramModeratorChatId ?? '';
const botToken = environment.telegramBotToken ?? '';

interface ChangeModel<T, F> {
  changeSchema: z.ZodType<T>;
  filterSchema: z.ZodType<F>;
  applyChange(filter: F, change: T, approvedBy: string): Promise<void>;
  formatChangeMessage(filter: F, change: T): string;
}

function defineChangeModel<T, F>(model: ChangeModel<T, F>): ChangeModel<T, F> {
  return model;
}

const models = {
  restaurant: defineChangeModel({
    changeSchema: z.object({
      address: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      openingHours: openingHoursSchema,
    }).strict(),
    filterSchema: z.object({
      id: z.number().int(),
    }).strict(),
    async applyChange(filter, change, approvedBy) {
      const { commitRestaurantsFile, getLatestRestaurantsFile } = await import('./git.ts');
      const restaurantsClone = z.array(restaurantSchema).parse(parse(await getLatestRestaurantsFile()));
      const idx = restaurantsClone.findIndex((r) => r.id === filter.id);
      if (idx > -1) {
        restaurantsClone[idx] = { ...restaurantsClone[idx], ...change };
      }
      const newContents = stringify(restaurantsClone);
      await commitRestaurantsFile(newContents, `Update restaurants.yml with user change\n\nApproved by: ${approvedBy}`);
    },
    formatChangeMessage(filter, change) {
      const latLngLink = (lat: number, lon: number) =>
        `[${lat}, ${lon}](http://www.google.com/maps/place/${lat},${lon})`;

      const restaurant = restaurants.find((r) => r.id === filter.id);
      if (!restaurant) {
        throw new Error('Restaurant not found.');
      }
      let formattedChange = '';
      if (change.openingHours) {
        formattedChange += change.openingHours
          .map((nextHours, i) => {
            const previousHours = restaurant.openingHours[i];
            const weekday = moment()
              .set({ isoWeekday: i + 1 })
              .format('ddd');
            return [weekday, formatHours(previousHours), formatHours(nextHours)];
          })
          .filter(([, prev, next]) => prev !== next)
          .map(([weekday, prev, next]) => `${weekday}: ${prev} -> ${next}`)
          .join('\n');
      }

      if (change.address) {
        formattedChange += `\nAddress: ${restaurant.address} -> ${change.address}`;
      }

      if (change.latitude && change.longitude) {
        formattedChange += `\nLocation: ${
          latLngLink(
            restaurant.latitude,
            restaurant.longitude,
          )
        } -> ${latLngLink(change.latitude, change.longitude)}`;
      }

      return `Restaurant name: ${restaurant.name_i18n.fi}\nHomepage: ${restaurant.url}\n\n${formattedChange}`;
    },
  }),
};

let telegram: Telegraf.Telegram;
let bot: Telegraf.Telegraf<Telegraf.Context>;

if ((chatId && botToken) || environment.isTest) {
  telegram = new Telegraf.Telegram(botToken);
  bot = new Telegraf.Telegraf(botToken);
  bot.on('callback_query', async (ctx) => {
    if (!ctx.callbackQuery) {
      return;
    }
    const user = ctx.callbackQuery.from;
    try {
      const [action, uuid] = (ctx.callbackQuery.data ?? '').split(':');
      const time = moment().format('[on] DD.MM.YYYY [at] HH:mm');
      const message = ctx.callbackQuery.message;
      const originalText = message && 'text' in message ? message.text : '';
      switch (action) {
        case 'accept': {
          const change = await db.selectFrom('changes')
            .where('uuid', '=', uuid)
            .selectAll()
            .executeTakeFirst();

          if (!change) {
            throw new Error('Change not found in database.');
          }
          const model = models[change.data_type];
          const modelChange = model.changeSchema.parse(change.change);
          const modelFilter = model.filterSchema.parse(change.filter);

          await model.applyChange(modelFilter, modelChange, user.username || 'unknown user');

          await db.updateTable('changes')
            .set({
              applied_by: user.username || 'unknown user',
              applied_at: sql<Date>`now()`,
            })
            .where('uuid', '=', uuid)
            .execute();

          await ctx.editMessageText(
            originalText.replace(
              '📝 Change requested',
              `✅ Change accepted by [${user.username}](tg://user?id=${user.id}) ${time}`,
            ),
            Telegraf.Extra.markdown()
              .webPreview(false)
              .markup((m) => m.inlineKeyboard([])),
          );
          break;
        }
        case 'reject': {
          await db.deleteFrom('changes').where('uuid', '=', uuid).execute();
          await ctx.editMessageText(
            originalText.replace(
              '📝 Change requested',
              `🚫 Change rejected by [${user.username}](tg://user?id=${user.id}) ${time}`,
            ),
            Telegraf.Extra.markdown()
              .webPreview(false)
              .markup((m) => m.inlineKeyboard([])),
          );
          break;
        }
      }
    } catch (e: unknown) {
      console.log(e);
      ctx.reply(
        `[${user.username}](tg://user?id=${user.id}), Error: ${e instanceof Error ? e.message : 'unknown'}`,
        Telegraf.Extra.markdown(),
      );
    }
  });

  bot.startPolling();
}

async function createChange(dataType: 'restaurant', filter: unknown, change: unknown) {
  const model = models[dataType];
  if (!model) {
    throw new Error('Change model does not exist.');
  }
  const modelChange = model.changeSchema.parse(change);
  const modelFilter = model.filterSchema.parse(filter);
  const dbChange = await db.insertInto('changes')
    .values({
      data_type: dataType,
      filter: JSON.stringify(filter),
      change: JSON.stringify(change),
    })
    .returningAll()
    .executeTakeFirst();
  if (!dbChange) {
    throw new Error('Failed to insert change into database.');
  }
  return {
    uuid: dbChange.uuid,
    prettyPrint: model.formatChangeMessage(modelFilter, modelChange),
  };
}

export default new Hono()
  .use(rateLimiter({
    // 15 requests in 15 mins
    windowMs: 15 * 60 * 1000,
    limit: 15,
    keyGenerator: (c) =>
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      '',
  }) as unknown as MiddlewareHandler)
  .get('/:uuids', async (c) => {
    const changes = await db
      .selectFrom('changes')
      .where('uuid', 'in', c.req.param('uuids').split(','))
      .selectAll()
      .execute();
    return c.json(changes.map((change) => ({
      createdAt: change.created_at,
      appliedAt: change.applied_at,
      change: change.change,
      filter: change.filter,
      dataType: change.data_type,
    })));
  })
  .post('/', async (c) => {
    try {
      const { filter, dataType, change } = await c.req.json();

      const { uuid, prettyPrint } = await createChange(dataType, filter, change);

      await telegram.sendMessage(
        chatId,
        `📝 Change requested\n${prettyPrint}`,
        Telegraf.Extra.markdown()
          .webPreview(false)
          .markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Accept', `accept:${uuid}`),
              m.callbackButton('Reject', `reject:${uuid}`),
            ])
          ),
      );

      return c.json({ uuid });
    } catch (e: unknown) {
      throw new HTTPException(400, { message: e instanceof Error ? e.message : 'Unknown error' });
    }
  });
