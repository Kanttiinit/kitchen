import { inspect } from 'node:util';
import z from 'zod';

import parsers from './parsers/index.ts';
import { menuList } from '../db.ts';

export const menuParserResultSchema = z.object({
  day: z.string(),
  courses: menuList,
});

export type MenuItem = z.infer<typeof menuParserResultSchema>;

export interface Parser {
  pattern: RegExp;
  parse: (url: string, lang: 'fi' | 'en') => Promise<Array<MenuItem>>;
}

export default async function parse(url: string, lang: 'fi' | 'en') {
  if (!lang) {
    throw new Error('The second argument (lang) is required!');
  }

  const parser = parsers.find((p) => url.match(p.pattern));
  if (!parser) {
    throw new Error('No parser found for: ' + url);
  }

  return z.array(menuParserResultSchema).parse(await parser.parse(url, lang));
}

if (import.meta.main) {
  const lang = process.argv[3];
  const menu = await parse(process.argv[2], lang === 'fi' || lang === 'en' ? lang : 'fi');
  console.log(inspect(menu, false, null));
  process.exit(0);
}
