"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = exports.Sessions = void 0;
var axios_1 = require("axios");
var node_html_parser_1 = require("node-html-parser");
var axios_cookiejar_support_1 = require("axios-cookiejar-support");
var tough_cookie_1 = require("tough-cookie");
var JSONtoFormDataString = function (data) { return Object.entries(data).map(function (x) { return "".concat(x[0], "=").concat(x[1]); }).join('&'); };
exports.Sessions = [];
var Session = /** @class */ (function () {
    function Session(cookie) {
        var _this = this;
        if (cookie === void 0) { cookie = ''; }
        this.jar = new tough_cookie_1.CookieJar();
        this.baseURL = 'https://aules.edu.gva.es';
        this.request = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: this.jar }));
        cookie.split(';').forEach(function (c) {
            var cookie = c.split('=');
            cookie[1] && _this.jar.setCookieSync(cookie[0], cookie[1]);
        });
        exports.Sessions.push(this);
    }
    Session.prototype.apiRequest = function (method, url, options) {
        if (options === void 0) { options = {}; }
        return this.request(__assign({ method: method, url: url, baseURL: this.baseURL }, options));
    };
    Session.prototype.login = function (course, username, password) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var mainPageResponse, loginToken, loginResponse, loginResponseDoc, usermenu;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.apiRequest('GET', "/".concat(course, "/login/index.php"), { headers: {} })];
                    case 1:
                        mainPageResponse = _e.sent();
                        loginToken = (_a = (0, node_html_parser_1.parse)(mainPageResponse.data).querySelector('[name="logintoken"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('value');
                        return [4 /*yield*/, this.apiRequest('POST', "/".concat(course, "/login/index.php"), {
                                headers: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                data: JSONtoFormDataString({
                                    logintoken: loginToken,
                                    username: username,
                                    password: password
                                })
                            })];
                    case 2:
                        loginResponse = _e.sent();
                        loginResponseDoc = (0, node_html_parser_1.parse)(loginResponse.data);
                        usermenu = loginResponseDoc.querySelector('#usermenu');
                        if (!usermenu) return [3 /*break*/, 4];
                        this.baseURL += "/".concat(course);
                        _d = {
                            success: true,
                            cookie: this.jar.toJSON().cookies.map(function (c) { return "".concat(c.key, "=").concat(c.value); }).join('; '),
                            user: {
                                name: usermenu.text.trim(),
                                profilePicture: (_c = (_b = loginResponseDoc.querySelector('.userpicture')) === null || _b === void 0 ? void 0 : _b.getAttribute('src')) === null || _c === void 0 ? void 0 : _c.replace('f2', 'f1')
                            }
                        };
                        return [4 /*yield*/, this.getEvents(loginResponseDoc)];
                    case 3: return [2 /*return*/, (_d.events = _e.sent(),
                            _d)];
                    case 4: return [2 /*return*/, {
                            success: false
                        }];
                }
            });
        });
    };
    Session.prototype.isSessionValid = function () {
        return __awaiter(this, void 0, void 0, function () {
            var homePageDoc, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = node_html_parser_1.parse;
                        return [4 /*yield*/, this.apiRequest('GET', '/my')];
                    case 1:
                        homePageDoc = _a.apply(void 0, [(_b.sent()).data]);
                        return [2 /*return*/, homePageDoc.querySelector('#usermenu') ? true : false];
                }
            });
        });
    };
    // User
    Session.prototype.getUserInfo = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var userDoc, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _f = node_html_parser_1.parse;
                        return [4 /*yield*/, this.apiRequest('GET', '/user/profile.php')];
                    case 1:
                        userDoc = _f.apply(void 0, [(_g.sent()).data]);
                        return [2 /*return*/, {
                                id: (_a = userDoc.querySelector('.contentnode.idnumber.aduseropt')) === null || _a === void 0 ? void 0 : _a.lastChild.childNodes[1].text,
                                name: (_b = userDoc.querySelector('.contentnode.fullname')) === null || _b === void 0 ? void 0 : _b.text,
                                email: (_c = userDoc.querySelector('.contentnode.email')) === null || _c === void 0 ? void 0 : _c.lastChild.childNodes[1].text,
                                profilePicture: (_e = (_d = userDoc.querySelector('.userpicture')) === null || _d === void 0 ? void 0 : _d.getAttribute('src')) === null || _e === void 0 ? void 0 : _e.replace('f2', 'f1'),
                            }];
                }
            });
        });
    };
    // My Area
    Session.prototype.getEvents = function (personalAreaDoc) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, events, childNodes;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(personalAreaDoc !== null && personalAreaDoc !== void 0)) return [3 /*break*/, 1];
                        _b = personalAreaDoc;
                        return [3 /*break*/, 3];
                    case 1:
                        _c = node_html_parser_1.parse;
                        return [4 /*yield*/, this.apiRequest('GET', '/me')];
                    case 2:
                        _b = _c.apply(void 0, [(_d.sent()).data]);
                        _d.label = 3;
                    case 3:
                        personalAreaDoc = _b;
                        events = personalAreaDoc.querySelector('.card-text.content.calendarwrapper');
                        childNodes = (_a = events === null || events === void 0 ? void 0 : events.childNodes) !== null && _a !== void 0 ? _a : [];
                        return [2 /*return*/, childNodes.map(function (c) {
                                var _a;
                                return ({
                                    icon: (_a = c.childNodes[0].childNodes[0].parentNode.getAttribute('src')) !== null && _a !== void 0 ? _a : '',
                                    title: c.childNodes[1].childNodes[1].text,
                                    time: c.childNodes[1].childNodes[2].text
                                });
                            })];
                }
            });
        });
    };
    return Session;
}());
exports.Session = Session;
var s = new Session();
s.login('batxillerat', '***REMOVED***', '***REMOVED***').then(function (x) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log(x);
                _b = (_a = console).log;
                return [4 /*yield*/, s.getUserInfo()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
