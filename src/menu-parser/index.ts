import { inspect } from 'node:util';
import parsers from './parsers/index.ts';
import { Property } from './utils.ts';

export interface MenuItem {
  day: string;
  courses: Array<{
    title: string;
    properties: Array<Property>;
  }>;
}

export interface Parser {
  pattern: RegExp;
  parse: (url: string, lang: 'fi' | 'en') => Promise<Array<MenuItem>>;
}

export default function parse(url: string, lang: 'fi' | 'en') {
  if (!lang) {
    throw new Error('The second argument (lang) is required!');
  }

  // find a suitable parser
  const parser = parsers.find((p) => url.match(p.pattern));

  if (parser) {
    return parser.parse(url, lang);
  }

  throw new Error('No parser found for: ' + url);
}

if (import.meta.main) {
  const lang = process.argv[3];
  const menu = await parse(process.argv[2], lang === 'fi' || lang === 'en' ? lang : 'fi');
  console.log(inspect(menu, false, null));
}
