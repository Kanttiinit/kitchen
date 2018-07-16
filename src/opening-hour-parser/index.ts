import parsers from './parsers';
import { OpeningHour } from '../models/OpeningHour';

export interface OpeningHourParser {
  canParseURL(url: string): boolean;
  parse(url: string): Promise<Array<OpeningHour>>;
}

const parse = (url: string) => {
  const parser = parsers.find(parser => parser.canParseURL(url));
  if (!parser) {
    throw new Error('No suitable parser found for ' + url);
  }
  return parser.parse(url);
};

if (!module.parent) {
  parse(process.argv[2]).then(console.log);
}
