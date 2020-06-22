import * as dotenv from 'dotenv';
dotenv.config();

export const sessionSecret = process.env.SESSION_SECRET;
export const origins = process.env.ORIGINS
  ? process.env.ORIGINS.split(',')
  : [];
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
export const universalAnalyticsId = process.env.UA_ID;
export const adminPassword = process.env.ADMIN_PASSWORD;
export const port = process.env.PORT || 3000;
export const databaseURL = process.env.DATABASE_URL;
export const sequelizeLogging = Boolean(Number(process.env.SEQUELIZE_LOGGING));
export const telegramModeratorChatId = Number(process.env.TG_CHAT_ID);
export const telegramFeedbackChatId = Number(process.env.TG_FEEDBACK_CHAT_ID);
export const telegramBotToken = process.env.BOT_TOKEN;
export const dropboxToken = process.env.DROPBOX_TOKEN;
export const sentryDSN = process.env.SENTRY_DSN;
