import * as fetch from 'node-fetch';
import {JSDOM} from 'jsdom';
import { OpeningHour } from '../models/OpeningHour';

const days = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'];

export const parseHours = (dayRange: string, timeRange: string): OpeningHour => {
  const [startDay, endDay] = dayRange.toLowerCase().split(/\s*\-\s*/);
  const daysOfWeek = [];
  for (let i = days.indexOf(startDay); i <= days.indexOf(endDay); i++) {
    daysOfWeek.push(i);
  }
  if (timeRange.includes('-')) {
    const [startTime, endTime] = timeRange.split(/\s*\-\s*/);
    return {
      daysOfWeek,
      opens: startTime.replace('.', ':'),
      closes: endTime.replace('.', ':')
    };
  }
  return {
    daysOfWeek,
    closed: true
  };
};

export const fetchDocument = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  const {document} = new JSDOM(html, {features: {QuerySelector: true}}).window;
  return document;
}
