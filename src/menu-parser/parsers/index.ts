import amica from './amica.ts';
import hamis from './hamis.ts';
import sodexo from './sodexo.ts';
import taffa from './taffa.ts';
import unicafe from './unicafe.ts';
import maukas from './maukas.ts';
import ravioli from './ravioli.ts';
import fazer from './fazer.ts';
import kipsari from './kipsari.ts';
import restel from './restel.ts';
import menssa from './menssa.ts';
import jamix from './jamix.ts';

import { Parser } from '../index.ts';

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
  menssa,
  jamix,
];

export default parsers;
