"use strict";
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
exports.__esModule = true;
var models_1 = require("../models");
var index_1 = require("./index");
var langs = ['fi', 'en'];
function createOrUpdateMenu(menu, restaurant) {
    return __awaiter(this, void 0, void 0, function () {
        var existingMenu;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models_1["default"].Menu.findOne({
                        where: {
                            day: menu.day,
                            RestaurantId: restaurant.id
                        }
                    })];
                case 1:
                    existingMenu = _a.sent();
                    if (existingMenu) {
                        return [2 /*return*/, existingMenu.update({ courses_i18n: menu.courses_i18n })];
                    }
                    return [2 /*return*/, models_1["default"].Menu.create({
                            day: menu.day,
                            RestaurantId: restaurant.id,
                            courses_i18n: menu.courses_i18n
                        })];
            }
        });
    });
}
function joinLangMenus(langMenus) {
    return langMenus[0].map(function (menu) {
        return {
            day: menu.day,
            courses_i18n: langs.reduce(function (carry, lang, j) {
                carry[lang] = langMenus[j].find(function (m) { return m.day === menu.day; }).courses;
                return carry;
            }, {})
        };
    });
}
function updateRestaurantMenus(restaurant) {
    return __awaiter(this, void 0, void 0, function () {
        var langMenus, menus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(langs.map(function (lang) { return index_1["default"](restaurant.menuUrl, lang); }))];
                case 1:
                    langMenus = _a.sent();
                    menus = joinLangMenus(langMenus);
                    console.log("\tFound " + menus.length + " days of menus.");
                    return [2 /*return*/, Promise.all(menus.map(function (menu) { return createOrUpdateMenu(menu, restaurant); }))];
            }
        });
    });
}
exports.updateRestaurantMenus = updateRestaurantMenus;
function updateAllRestaurants() {
    return __awaiter(this, void 0, void 0, function () {
        var restaurants, _i, restaurants_1, restaurant, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models_1["default"].Restaurant.findAll()];
                case 1:
                    restaurants = _a.sent();
                    console.log('Start processing ' + restaurants.length + ' restaurants.\n');
                    _i = 0, restaurants_1 = restaurants;
                    _a.label = 2;
                case 2:
                    if (!(_i < restaurants_1.length)) return [3 /*break*/, 7];
                    restaurant = restaurants_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    console.log("Processing " + restaurant.name_i18n.fi + ":");
                    return [4 /*yield*/, updateRestaurantMenus(restaurant)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.log("Failed processing " + restaurant.name_i18n.fi + ".", e_1);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.updateAllRestaurants = updateAllRestaurants;
if (!module.parent) {
    models_1["default"].sequelize.sync()
        .then(function () { return updateAllRestaurants(); })
        .then(function () { return process.exit(); });
}
