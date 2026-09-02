const o = Deno.env.get('ORIGINS');

export const origins = o ? o.split(',') : [];
export const isProduction = Deno.env.get('NODE_ENV') === 'production';
export const isTest = Deno.env.get('NODE_ENV') === 'test';
export const port = Deno.env.get('PORT') || 3000;
export const databaseURL = Deno.env.get('DATABASE_URL');
export const telegramModeratorChatId = Number(Deno.env.get('TG_CHAT_ID'));
export const telegramFeedbackChatId = Number(Deno.env.get('TG_FEEDBACK_CHAT_ID'));
export const telegramBotToken = Deno.env.get('BOT_TOKEN');
export const githubAppId = Deno.env.get('GITHUB_APP_ID');
export const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');
