import { Op } from 'sequelize';
import * as express from 'express';
import { Change } from '../../models';
import Telegraf from 'telegraf';
import * as Telegram from 'telegraf/telegram';
import * as Extra from 'telegraf/extra';
import * as moment from 'moment';

import * as environment from '../../environment';

const chatId = environment.telegramChatId;
const botToken = environment.telegramBotToken;

export let telegram;
export let bot;

if ((chatId && botToken) || environment.isTest) {
  telegram = new Telegram(botToken);
  bot = new Telegraf(botToken);
  bot.on('callback_query', async ctx => {
    const user = ctx.callbackQuery.from;
    try {
      const [action, uuid] = ctx.callbackQuery.data.split(':');
      const change = await Change.findByPk(uuid);
      const time = moment().format('[on] DD.MM.YYYY [at] HH:mm');
      switch (action) {
        case 'accept':
          await change.apply(user.username);
          await ctx.editMessageText(
            ctx.callbackQuery.message.text.replace(
              '📝 Change requested',
              `✅ Change accepted by [${user.username}](tg://user?id=${
                user.id
              }) ${time}`
            ),
            Extra.markdown()
            .webPreview(false)
            .markup(m => m.inlineKeyboard([]))
          );
          break;
        case 'reject':
          await change.destroy();
          await ctx.editMessageText(
            ctx.callbackQuery.message.text.replace(
              '📝 Change requested',
              `🚫 Change rejected by [${user.username}](tg://user?id=${
                user.id
              }) ${time}`
            ),
            Extra.markdown()
            .webPreview(false)
            .markup(m => m.inlineKeyboard([]))
          );
          break;
      }
    } catch (e) {
      console.log(e);
      ctx.reply(
        `[${user.username}](tg://user?id=${user.id}), Error: ${e.message}`,
        Extra.markdown()
      );
    }
  });

  bot.startPolling();
}

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
      `📝 Change requested\n${await change.prettyPrint()}`,
      Extra.markdown()
      .webPreview(false)
      .markup(m =>
        m.inlineKeyboard([
          m.callbackButton('Accept', `accept:${change.uuid}`),
          m.callbackButton('Reject', `reject:${change.uuid}`)
        ])
      )
    );

    res.json({ uuid: change.uuid });
    next();
  } catch (e) {
    next({ code: 400, message: e.message });
  }
});
