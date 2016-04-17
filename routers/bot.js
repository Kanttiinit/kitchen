const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TG_BOT_TOKEN);
const groupId = Number(process.env.TG_GROUP_ID);

module.exports = express.Router()
.post('/send-message', (req, res) => {
   bot.sendMessage(groupId, req.body.message)
   .then(_ => res.json({message: 'ok'}));
});
