import models from '../models';
import moment from 'moment';
import pug from 'pug';
import webshot from 'webshot';
import {PassThrough} from 'stream';
import momentFI from 'moment/locale/fi';

const template = pug.compileFile(__dirname + '/template.jade');

function getColor(property) {
   const colors = {
      'L': '#795548',
      'G': '#FF5722',
      'V': '#4CAF50',
      'M': '#E91E63',
      'VL': '#3F51B5',
      'A': '#607D8B',
      'K': '#168b33',
      'VE': '#4CAF50'
   };

   if (property in colors)
      return colors[property];
   else
      return '#999';
}

export function renderHtml(restaurant, day, width, lang = 'fi') {
   moment.locale(lang);

   if (width)
      width = Math.min(Math.max(400, width), 1000);

   const courses = restaurant.Menus.length ? restaurant.Menus[0].courses || [] : [];
   return template({
      restaurant: restaurant.getPublicAttributes(lang),
      courses,
      getColor,
      width,
      date: moment(day).format('dddd D.M.'),
      openingHours: restaurant.getPrettyOpeningHours()[moment(day).isoWeekday() - 1]
   });
}

export function getImageStream(html) {
   const stream = webshot(html, {
      siteType: 'html',
      streamType: 'png',
      shotSize: {width: 'all', height: 'all'},
      windowSize: {width: 'all', height: 'all'},
   });

   const passthrough = new PassThrough();
   stream.pipe(passthrough);

   return passthrough;
}
