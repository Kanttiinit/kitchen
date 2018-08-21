import { OpeningHourParser } from '..';
import { parseHours, fetchDocument } from '../helpers';

const parser: OpeningHourParser = {
  canParseURL(url) {
    return true;
  },
  async parse(url) {
    const document = await fetchDocument(url);
    const container = document.querySelector(
      '#block-sxo-opening-hours-facility-opening-hours > div > div > div:nth-child(3)'
    );
    const hours = [];
    for (const block of Array.from(container.querySelectorAll('div'))) {
      const [days, times] = Array.from((block as any).querySelectorAll('span'));
      hours.push(parseHours(days.textContent, times.textContent));
    }
    return hours;
  }
};

export default parser;
