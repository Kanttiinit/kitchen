import {inspect} from 'util';
import parsers from './parsers';

interface MenuItem {
  day: string,
  courses: Array<{
    title: string,
    properties: Array<string>
  }>
};

export interface Parser {
  pattern: RegExp,
  parse: (url: string, lang: 'fi' | 'en') => Promise<Array<MenuItem>>
};

export default function parse(url, lang) {
  if (!lang) {
    throw new Error('The second argument (lang) is required!');
  }

  // find a suitable parser
  const parser = parsers.find(p => url.match(p.pattern));

  if (parser) {
    return parser.parse(url, lang);
  }

  return Promise.reject('there is no parser for ' + url);
}

async function startFromCommandLine() {
  const menu = await parse(process.argv[2], process.argv[3] || 'fi');
  console.log(inspect(menu, null, null));
}

if (!module.parent) {
  startFromCommandLine();
}
