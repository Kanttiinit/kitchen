import Telegraf from 'telegraf';
import moment from 'moment';
import { parse, stringify } from '@std/yaml';
import z from 'zod';

import * as environment from '../environment.ts';
import { Hono } from 'hono';
import { Change, db } from '../db.ts';
import { HTTPException } from 'hono/http-exception';
import { openingHoursSchema, restaurants, restaurantSchema } from '../../data/data.ts';
import './git.ts';
import { commitRestaurantsFile, getLatestRestaurantsFile } from './git.ts';
import { formatHours } from '../utils.ts';

const chatId = environment.telegramModeratorChatId ?? '';
const botToken = environment.telegramBotToken ?? '';

interface ChangeModel<T, F> {
  changeSchema: z.ZodType<T>;
  filterSchema: z.ZodType<F>;
  applyChange(filter: F, change: T): Promise<void>;
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
    }),
    filterSchema: z.object({
      id: z.number().int(),
    }),
    async applyChange(filter, change) {
      const restaurantsClone = z.array(restaurantSchema).parse(parse(await getLatestRestaurantsFile()));
      const idx = restaurantsClone.findIndex((r) => r.id === filter.id);
      if (idx > -1) {
        restaurantsClone[idx] = { ...restaurantsClone[idx], ...change };
      }
      const newContents = stringify(restaurantsClone);
      await commitRestaurantsFile(newContents, 'Update restaurants.yml with user change');
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
          .map(([weekday, prev, next], i) => `${weekday}: ${prev} -> ${next}`)
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
  bot.on('text', (ctx) => console.log(ctx));
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
          const change = await db.queryObject<Change>('SELECT * FROM changes WHERE uuid = $1', [uuid]);
          const model = models[change.data_type];
          const modelChange = model.changeSchema.parse(change.change);
          const modelFilter = model.filterSchema.parse(change.filter);
          await model.applyChange(modelFilter, modelChange);

          // await change.apply(user.username);
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
          await db.queryObject('DELETE FROM changes WHERE uuid = $1', [uuid]);
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
    } catch (e: any) {
      console.log(e);
      ctx.reply(
        `[${user.username}](tg://user?id=${user.id}), Error: ${e.message}`,
        Telegraf.Extra.markdown(),
      );
    }
  });

  bot.startPolling();
}

async function createChange(dataType: 'restaurant', filter: Record<string, any>, change: unknown) {
  const model = models[dataType];
  if (!model) {
    throw new Error('Change model does not exist.');
  }
  const modelChange = model.changeSchema.parse(change);
  const modelFilter = model.filterSchema.parse(change);
  await db.queryObject('INSERT INTO changes (data_type, filter, change) VALUES ($1, $2, $3)', [
    dataType,
    JSON.stringify(filter),
    JSON.stringify(change),
  ]);
  return model.formatChangeMessage(modelFilter, modelChange);
}

export default new Hono()
  .get('/:uuids', async (c) => {
    const changes = await db.queryArray<Change>('SELECT * FROM changes WHERE uuid = ANY($1)', [
      c.req.param('uuids').split(','),
    ]);
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
      const { modelFilter, modelName, change } = await c.req.json();

      const prettyPrint = await createChange(modelName, modelFilter, change);

      await telegram.sendMessage(
        chatId,
        `📝 Change requested\n${prettyPrint}`,
        Telegraf.Extra.markdown()
          .webPreview(false)
          .markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('Accept', `accept:${change.uuid}`),
              m.callbackButton('Reject', `reject:${change.uuid}`),
            ])
          ),
      );

      return c.json({ uuid: change.uuid });
    } catch (e: any) {
      throw new HTTPException(400, { message: e.message });
    }
  });
