import { createMiddleware } from 'hono/factory';

export function formatIds(idString: string) {
  return (
    idString ? idString.split(',').map((id) => +id).filter((id) => !isNaN(id)) : []
  );
}

function formatHour(hour: number) {
  return String(hour).replace(/([0-9]{1,2})([0-9]{2})/, '$1:$2');
}

export function formatHours(hours: [number, number] | undefined | null) {
  if (!hours) {
    return null;
  }

  return `${formatHour(hours[0])} - ${formatHour(hours[1])}`;
}

export function formatFields(node: unknown, lang: 'fi' | 'en'): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => formatFields(item, lang));
  }

  if (typeof node !== 'object' || node === null) {
    return node;
  }

  const obj = node as { [key: string]: unknown };
  const output: { [key: string]: unknown } = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    const isI18nObj = key.endsWith('_i18n') &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value);

    if (isI18nObj) {
      const map = value as { [key: string]: unknown };
      const normalizedKey = key.slice(0, -'_i18n'.length);
      const fallbackKey = Object.keys(map)[0];
      const picked = lang in map ? map[lang] : (fallbackKey !== undefined ? map[fallbackKey] : null);
      output[normalizedKey] = formatFields(picked, lang);
    } else if (key === 'openingHours') {
      output[key] = (value as any).map(formatHours);
    } else {
      output[key] = formatFields(value, lang);
    }
  }
  return output;
}

export const parseLanguage = createMiddleware<{ Variables: { lang: 'fi' | 'en' } }>(async (c, next) => {
  const lang = c.req.query('lang') ?? 'fi';
  if (lang === 'fi' || lang === 'en') {
    c.set('lang', lang);
  } else {
    c.set('lang', 'fi');
  }
  await next();
});
