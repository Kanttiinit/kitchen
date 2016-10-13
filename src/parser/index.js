import util from 'util';
import parsers from './parsers';

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
  console.log(util.inspect(menu, null, null));
}

if (!module.parent) {
  startFromCommandLine();
}
