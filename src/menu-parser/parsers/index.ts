import amica from './amica';
import hamis from './hamis';
import sodexo from './sodexo';
import taffa from './taffa';
import unicafe from './unicafe';
import maukas from './maukas';
import ravioli from './ravioli';
import fazer from './fazer';
import kipsari from './kipsari';
import restel from './restel';
import compassgroup from './compassgroup';

import { Parser } from '../index';

const parsers: Array<Parser> = [
  amica,
  hamis,
  sodexo,
  taffa,
  unicafe,
  maukas,
  ravioli,
  fazer,
  kipsari,
  restel,
  compassgroup
];

export default parsers;
