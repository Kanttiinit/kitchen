import { Change } from '../models';
import Telegraf from 'telegraf';
import * as Telegram from 'telegraf/telegram';
import * as Markup from 'telegraf/markup';
import * as Extra from 'telegraf/extra';

const bot = new Telegraf(process.env.BOT_TOKEN);
const telegram = new Telegram(process.env.BOT_TOKEN);
const chatId = Number(process.env.TG_CHAT_ID);

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

export default async (req, res, next) => {
  try {
    const change = await Change.create(req.body);

    await telegram.sendMessage(
      chatId,
      `*Change requested*\n${await change.prettyPrint()}`,
      Extra.markdown().markup(m =>
        m.inlineKeyboard([m.callbackButton('Accept', `accept:${change.id}`)])
      )
    );

    res.json({ message: 'Success.' });
  } catch (e) {
    next({ code: 400, message: e.message });
  }
};
