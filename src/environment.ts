
export const isProduction = Deno.env.get('NODE_ENV') === 'production';
export const isTest = Deno.env.get('NODE_ENV') === 'test';

// comma separated list of allowed CORS origins
const o = Deno.env.get('ORIGINS');
export const origins = o ? o.split(',') : [];

// URL to Postgres database, will use file-backed PGlite database if missing
export const databaseURL = Deno.env.get('DATABASE_URL');

// Telegram bot token and chat IDs for feedback endpoint and user change system
export const telegramBotToken = Deno.env.get('BOT_TOKEN');
export const telegramModeratorChatId = Number(Deno.env.get('TG_CHAT_ID'));
export const telegramFeedbackChatId = Number(Deno.env.get('TG_FEEDBACK_CHAT_ID'));

// Github credentials for user change system
export const githubAppId = Deno.env.get('GITHUB_APP_ID');
export const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');
