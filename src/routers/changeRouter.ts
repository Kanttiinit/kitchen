import { Op } from 'sequelize';
import * as express from 'express';
import { Change } from '../models';
import Telegraf from 'telegraf';
import * as Telegram from 'telegraf/telegram';
import * as Extra from 'telegraf/extra';

let telegram;
const chatId = Number(process.env.TG_CHAT_ID);
if (process.env.NODE_ENV !== 'test') {
  telegram = new Telegram(process.env.BOT_TOKEN);
  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.on('callback_query', async ctx => {
    try {
      const [_, id] = ctx.callbackQuery.data.split(':');
      const change = await Change.findById(Number(id));
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
}

export default express
.Router()
.get('/accepted', async (req, res) => {
  const changes = await Change.findAll({
    where: {
      id: { [Op.in]: req.session.createdChanges || [] },
      appliedBy: { [Op.not]: null }
    }
  });
  req.session.createdChanges = (req.session.createdChanges || []).filter(
    id => !changes.some(change => change.id === id)
  );
  res.json(changes);
})
.post('/', async (req, res, next) => {
  try {
    const change = await Change.create(req.body);
    req.session.createdChanges = [
      ...(req.session.createdChanges || []),
      change.id
    ];

    if (process.env.NODE_ENV !== 'test') {
      await telegram.sendMessage(
        chatId,
        `*Change requested*\n${await change.prettyPrint()}`,
        Extra.markdown().markup(m =>
          m.inlineKeyboard([
            m.callbackButton('Accept', `accept:${change.id}`)
          ])
        )
      );
    }

    res.json({ message: 'Success.' });
    next();
  } catch (e) {
    next({ code: 400, message: e.message });
  }
});
