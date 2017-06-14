"use strict";
exports.__esModule = true;
var moment = require("moment");
var node_fetch_1 = require("node-fetch");
exports.propertyRegex = /\b([A-Z]{1,2})\b/g;
exports.getWeeks = function () {
    return [moment(), moment().add({ weeks: 1 })].map(function (d) { return d.startOf('week').add({ days: 1 }); });
};
exports.formatUrl = function (url, date) {
    if (date === void 0) { date = moment(); }
    return url
        .replace('%year%', date.format('YYYY'))
        .replace('%month%', date.format('MM'))
        .replace('%day%', date.format('DD'));
};
exports.json = function (url) { return node_fetch_1["default"](url).then(function (r) { return r.json(); }); };
exports.text = function (url) { return node_fetch_1["default"](url).then(function (r) { return r.text(); }); };
