"use strict";
exports.__esModule = true;
var moment = require("moment");
var pug_1 = require("pug");
var webshot_1 = require("webshot");
var stream_1 = require("stream");
require("moment/locale/fi");
var template = pug_1["default"].compileFile(__dirname + '/template.jade');
function getColor(property) {
    var colors = {
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
function renderHtml(restaurant, day, width, lang) {
    if (lang === void 0) { lang = 'fi'; }
    moment.locale(lang);
    if (width)
        width = Math.min(Math.max(400, width), 1000);
    var courses = restaurant.Menus.length ? restaurant.Menus[0].courses || [] : [];
    return template({
        restaurant: restaurant.getPublicAttributes(lang),
        courses: courses,
        getColor: getColor,
        width: width,
        date: moment(day).format('dddd D.M.'),
        openingHours: restaurant.getPrettyOpeningHours()[moment(day).isoWeekday() - 1]
    });
}
exports.renderHtml = renderHtml;
function getImageStream(html) {
    var stream = webshot_1["default"](html, {
        siteType: 'html',
        streamType: 'png',
        shotSize: { width: 'all', height: 'all' },
        windowSize: { width: 'all', height: 'all' }
    });
    var passthrough = new stream_1.PassThrough();
    stream.pipe(passthrough);
    return passthrough;
}
exports.getImageStream = getImageStream;
