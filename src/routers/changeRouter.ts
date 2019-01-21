import { Op } from 'sequelize';
import * as express from 'express';
import { Change } from '../models';
import Telegraf from 'telegraf';
import * as Telegram from 'telegraf/telegram';
import * as Extra from 'telegraf/extra';

const chatId = Number(process.env.TG_CHAT_ID);
export const telegram = new Telegram(process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('callback_query', async ctx => {
  try {
    const [, uuid] = ctx.callbackQuery.data.split(':');
    const change = await Change.findByPk(uuid);
    await change.apply(ctx.callbackQuery.from.username);
    await ctx.editMessageText(
      ctx.callbackQuery.message.text.replace(
        'Change requested',
        '*Change accepted*'
      ),
      Extra.markdown().markup(m => m.inlineKeyboard([]))
    );
  } catch (e) {
    console.log(e);
    ctx.reply(`Error: ${e.message}`);
  }
});

bot.startPolling();

export default express
.Router()
.get('/:uuids', async (req, res) => {
  const changes = await Change.findAll({
    where: {
      uuid: {
        [Op.in]: req.params.uuids.split(',')
      }
    }
  });
  res.json(changes.map(change => change.getPublicAttributes()));
})
.post('/', async (req, res, next) => {
  try {
    const change = await Change.create(req.body);

    await telegram.sendMessage(
      chatId,
      `*Change requested*\n${await change.prettyPrint()}`,
      Extra.markdown().markup(m =>
        m.inlineKeyboard([
          m.callbackButton('Accept', `accept:${change.uuid}`)
        ])
      )
    );

    res.json({ uuid: change.uuid });
    next();
  } catch (e) {
    next({ code: 400, message: e.message });
  }
});
