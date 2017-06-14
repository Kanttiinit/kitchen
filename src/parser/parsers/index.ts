import amica from './amica';
import hamis from './hamis';
import sodexo from './sodexo';
import taffa from './taffa';
import unicafe from './unicafe';
import maukas from './maukas';

import {Parser} from '../index';

const parsers: Array<Parser> = [
  amica,
  hamis,
  sodexo,
  taffa,
  unicafe,
  maukas
];

export default parsers;