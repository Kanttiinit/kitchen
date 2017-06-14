"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var express_1 = require("express");
var models_1 = require("../models");
var sortBy_1 = require("lodash/sortBy");
var getPublics = function (items, lang) { return items.map(function (item) { return item.getPublicAttributes(lang); }); };
var getMenus_1 = require("./getMenus");
var getRestaurantMenus_1 = require("./getRestaurantMenus");
exports.parseLanguage = function (req, res, next) {
    if (['fi', 'en'].includes(req.query.lang))
        req.lang = req.query.lang;
    else
        req.lang = 'fi';
    next();
};
exports.getFavorites = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var favorites;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, models_1["default"].Favorite.findAll()];
            case 1:
                favorites = _a.sent();
                res.json(getPublics(favorites, req.lang));
                return [2 /*return*/];
        }
    });
}); };
exports.getAreas = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var areas, data, ids;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, models_1["default"].Area.findAll({
                    where: { hidden: false },
                    include: [{ model: models_1["default"].Restaurant }]
                })];
            case 1:
                areas = _a.sent();
                data = getPublics(areas, req.lang);
                if (req.query.idsOnly) {
                    ids = data.map(function (area) { return (__assign({}, area, { restaurants: sortBy_1["default"](area.restaurants.map(function (r) { return r.id; })) })); });
                    res.json(ids);
                }
                else {
                    res.json(data);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.getRestaurants = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var queryPromise, _a, latitude, longitude, _b, distance, where, restaurants, e_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                queryPromise = void 0;
                if (req.query.location) {
                    _a = req.query.location.split(','), latitude = _a[0], longitude = _a[1];
                    _b = req.query.distance, distance = _b === void 0 ? 2000 : _b;
                    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
                        next({ code: 400, message: 'Bad request.' });
                    }
                    else {
                        queryPromise = models_1["default"].sequelize.query({
                            query: "\n          SELECT *\n          FROM (\n            SELECT *,\n            (point(:longitude, :latitude) <@> point(longitude, latitude)) * 1.61 as distance\n            FROM restaurants\n          ) as restaurants\n          WHERE hidden = false AND distance < :distance\n          ORDER BY distance;\n          "
                        }, {
                            model: models_1["default"].Restaurant,
                            mapToModel: true,
                            replacements: { latitude: latitude, longitude: longitude, distance: distance / 1000 }
                        });
                    }
                }
                else {
                    where = { id: undefined, hidden: false };
                    if (req.query.ids) {
                        where.id = { $in: req.query.ids.split(',').filter(function (id) { return !isNaN(id); }).map(function (id) { return Number(id); }) };
                    }
                    queryPromise = models_1["default"].Restaurant.findAll({ where: where });
                }
                return [4 /*yield*/, queryPromise];
            case 1:
                restaurants = _c.sent();
                res.json(getPublics(restaurants, req.lang));
                return [3 /*break*/, 3];
            case 2:
                e_1 = _c.sent();
                next(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports["default"] = express_1["default"].Router()
    .use(exports.parseLanguage)
    .get('/menus', getMenus_1["default"])
    .get('/restaurants/:restaurantId/menu(.:ext)?', getRestaurantMenus_1["default"])
    .get('/favorites', exports.getFavorites)
    .get('/areas', exports.getAreas)
    .get('/restaurants', exports.getRestaurants);
