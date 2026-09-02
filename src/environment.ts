export const origins = process.env.ORIGINS ? process.env.ORIGINS.split(',') : [];
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
export const port = process.env.PORT || 3000;
export const databaseURL = process.env.DATABASE_URL;
export const telegramModeratorChatId = Number(process.env.TG_CHAT_ID);
export const telegramFeedbackChatId = Number(process.env.TG_FEEDBACK_CHAT_ID);
export const telegramBotToken = process.env.BOT_TOKEN;
