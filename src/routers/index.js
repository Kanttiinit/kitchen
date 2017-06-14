"use strict";
exports.__esModule = true;
var express_1 = require("express");
var admin_1 = require("./admin");
var public_1 = require("./public");
var me_1 = require("./me");
var version = require('../../package.json').version;
exports["default"] = express_1["default"].Router()
    .use('/admin', admin_1["default"])
    .use('/me', me_1["default"])
    .use('/', public_1["default"])
    .get('/help', function (req, res) {
    return res.redirect('https://github.com/Kanttiinit/kitchen/blob/master/README.md');
})
    .get('/', function (req, res) { return res.json({ version: version }); })
    .get('*', function (req, res, next) { return next({ code: 404, message: 'Endpoint doesn\'t exist.' }); });
