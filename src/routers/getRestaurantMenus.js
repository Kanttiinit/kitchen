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
var _this = this;
exports.__esModule = true;
var moment = require("moment");
var models_1 = require("../models");
var aws = require("../utils/aws");
var image_generator_1 = require("../image-generator");
exports["default"] = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var _a, restaurantId, ext, width, day, filename, restaurant, url, imageStream, html;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, restaurantId = _a.restaurantId, ext = _a.ext;
                width = req.query.width;
                day = moment(req.query.day).format('YYYY-MM-DD');
                filename = restaurantId + '_' + day + '.png';
                return [4 /*yield*/, models_1["default"].Restaurant.findOne({
                        where: { id: restaurantId },
                        include: [
                            {
                                model: models_1["default"].Menu,
                                required: false,
                                where: { day: day }
                            }
                        ]
                    })];
            case 1:
                restaurant = _b.sent();
                if (!!restaurant) return [3 /*break*/, 2];
                next({ code: 404, message: 'Not found.' });
                return [3 /*break*/, 8];
            case 2:
                if (!!ext) return [3 /*break*/, 3];
                res.json(restaurant.getPublicAttributes(req.lang));
                return [3 /*break*/, 8];
            case 3:
                if (!(ext === 'png')) return [3 /*break*/, 7];
                return [4 /*yield*/, aws.getUrl(filename)];
            case 4:
                url = _b.sent();
                if (!!url) return [3 /*break*/, 6];
                imageStream = image_generator_1.getImageStream(image_generator_1.renderHtml(restaurant, day, width));
                return [4 /*yield*/, aws.upload(imageStream, filename)];
            case 5:
                url = _b.sent();
                _b.label = 6;
            case 6:
                res.redirect(url);
                return [3 /*break*/, 8];
            case 7:
                html = image_generator_1.renderHtml(restaurant, day, width);
                if (ext === 'html')
                    return [2 /*return*/, res.send(html)];
                return [2 /*return*/, image_generator_1.getImageStream(html).pipe(res)];
            case 8: return [2 /*return*/];
        }
    });
}); };
