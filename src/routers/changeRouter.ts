import Telegraf from 'telegraf';
import moment from 'moment';
import z from 'zod';

import * as environment from '../environment.ts';
import { Hono } from 'hono';
import { Change, db } from '../db.ts';
import { HTTPException } from 'hono/http-exception';
import { openingHoursSchema, restaurants } from '../../data/data.ts';
import { formatHours } from './index.ts';

const chatId = environment.telegramModeratorChatId ?? '';
const botToken = environment.telegramBotToken ?? '';

export let telegram: Telegraf.Telegram;
export let bot: Telegraf.Telegraf<Telegraf.Context>;

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
        case 'accept':
          // TODO:
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
        case 'reject':
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
    } catch (e) {
      console.log(e);
      ctx.reply(
        `[${user.username}](tg://user?id=${user.id}), Error: ${e.message}`,
        Telegraf.Extra.markdown(),
      );
    }
  });

  bot.startPolling();
}

const latLngLink = (lat: number, lon: number) => `[${lat}, ${lon}](http://www.google.com/maps/place/${lat},${lon})`;

const restaurantChangeSchema = z.object({
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingHours: openingHoursSchema,
});

type RestaurantChange = z.infer<typeof restaurantChangeSchema>;

function formatRestaurantChange(filter: Record<string, any>, change: RestaurantChange) {
  const filterKeys = Object.keys(filter);
  const restaurant = restaurants.find((r) => filterKeys.every((k) => filter[k] === (r as any)[k] || null));
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
}

async function createChange(dataType: 'restaurant', filter: Record<string, any>, change: RestaurantChange) {
  if (dataType === 'restaurant') {
    change = restaurantChangeSchema.parse(change);
  }
  await db.queryObject('INSERT INTO changes (data_type, filter, change) VALUES ($1, $2, $3)', [
    dataType,
    JSON.stringify(filter),
    JSON.stringify(change),
  ]);
  if (dataType === 'restaurant') {
    return formatRestaurantChange(filter, change);
  }
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
