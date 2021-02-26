import * as moment from 'moment';
import { JSDOM } from 'jsdom';

import { Parser } from '../index';
import {
  text,
  Property,
  propertyRegex,
  createPropertyNormalizer
} from '../utils';

const dateRegExp = /(\d+).(\d+)./g;

const parseToDate = (possiblyDate: string): string | null => {
    const match = dateRegExp.exec(possiblyDate);
    return match
        ? moment(match[0], "DD.M").format('YYYY-MM-DD')
        : null;
}

const parser: Parser = {
  pattern: /compassgroup/,
  async parse(url, lang) {
    const html = await text(url);
    const document = new JSDOM(html).window.document;

    const container = document.querySelector('#mid-column');
    const elements = [...container.querySelectorAll('p')];

    return Array.from(elements.reduce((acc: any, curr: any) => {
        const rowAsDate = parseToDate(curr.textContent);
        if (rowAsDate) {
            acc.push({
                day: rowAsDate,
                courses: Array.from([])
            })
        }
        return acc;
    }, []))
  }
};

export default parser;
