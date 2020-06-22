import * as Telegram from 'telegraf/telegram';

import * as environment from '../environment';

const chatId = environment.telegramFeedbackChatId;
const botToken = environment.telegramBotToken;
const telegram = new Telegram(botToken);

export default async (req, res, next) => {
  const { email = 'anonymous', message } = req.body;
  if (email.trim() !== '' && message.trim() !== '') {
    try {
      await telegram.sendMessage(
        chatId,
        `New feedback from ${email}:\n"${message}"`
      );
      res.json({ message: 'Success.' });
    } catch (err) {
      next(err);
    }
  } else {
    next({ code: 400, message: 'Bad request.' });
  }
};
