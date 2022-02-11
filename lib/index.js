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
exports.default = this;
exports.Sessions = [];
var Session = /** @class */ (function () {
    function Session(cookie) {
        var _this = this;
        if (cookie === void 0) { cookie = ''; }
        this.jar = new tough_cookie_1.CookieJar();
        this.baseURL = 'https://aules.edu.gva.es';
        this.sesskey = '';
        this.request = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: this.jar }));
        cookie.split(';').forEach(function (c) {
            var cookie = c.split('=');
            cookie[1] && _this.jar.setCookieSync(cookie[0], cookie[1]);
        });
        exports.Sessions.push(this);
    }
    Session.prototype.apiRequest = function (method, url, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var promise = this.request(__assign({ method: method, url: url, baseURL: this.baseURL }, options));
        promise.then(function (res) {
            var _a, _b;
            if (typeof (res.data) == 'string')
                _this.sesskey = (_b = (_a = res.data.match(/sesskey=(\w+)/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : _this.sesskey;
        });
        return promise;
    };
    Session.prototype.login = function (course, username, password) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var mainPageResponse, loginToken, loginResponse, loginResponseDoc, usermenu, events;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.apiRequest('GET', "/".concat(course, "/login/index.php"), { headers: {} })];
                    case 1:
                        mainPageResponse = _d.sent();
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
                        loginResponse = _d.sent();
                        loginResponseDoc = (0, node_html_parser_1.parse)(loginResponse.data);
                        usermenu = loginResponseDoc.querySelector('#usermenu');
                        if (usermenu) {
                            this.baseURL += "/".concat(course);
                            events = loginResponseDoc.querySelectorAll('[data-region="event-item"]');
                            return [2 /*return*/, {
                                    success: true,
                                    cookie: this.jar.toJSON().cookies.map(function (c) { return "".concat(c.key, "=").concat(c.value); }).join('; '),
                                    user: {
                                        name: usermenu.text.trim(),
                                        profilePicture: (_c = (_b = loginResponseDoc.querySelector('.userpicture')) === null || _b === void 0 ? void 0 : _b.getAttribute('src')) === null || _c === void 0 ? void 0 : _c.replace('f2', 'f1')
                                    },
                                    upcomingEvents: events.map(function (c) {
                                        var _a;
                                        return ({
                                            icon: (_a = c.childNodes[1].childNodes[0].getAttribute('src')) !== null && _a !== void 0 ? _a : '',
                                            title: c.childNodes[3].text,
                                            time: c.childNodes[5].text
                                        });
                                    })
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    success: false
                                }];
                        }
                        return [2 /*return*/];
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
    Session.prototype.getUserInfo = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var userDoc, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _k = node_html_parser_1.parse;
                        return [4 /*yield*/, this.apiRequest('GET', '/user/profile.php')];
                    case 1:
                        userDoc = _k.apply(void 0, [(_l.sent()).data]);
                        return [2 /*return*/, {
                                id: (_b = (_a = userDoc.querySelector('.contentnode.idnumber.aduseropt')) === null || _a === void 0 ? void 0 : _a.lastChild.childNodes[1].text) !== null && _b !== void 0 ? _b : '',
                                name: (_d = (_c = userDoc.querySelector('.contentnode.fullname')) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : '',
                                email: (_f = (_e = userDoc.querySelector('.contentnode.email')) === null || _e === void 0 ? void 0 : _e.lastChild.childNodes[1].text) !== null && _f !== void 0 ? _f : '',
                                profilePicture: (_j = (_h = (_g = userDoc.querySelector('.userpicture')) === null || _g === void 0 ? void 0 : _g.getAttribute('src')) === null || _h === void 0 ? void 0 : _h.replace('f2', 'f1')) !== null && _j !== void 0 ? _j : '',
                            }];
                }
            });
        });
    };
    Session.prototype.getEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var upcomingEvents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.apiRequest('POST', "/lib/ajax/service.php?sesskey=".concat(this.sesskey, "&info=core_calendar_get_calendar_upcoming_view"), {
                            headers: { 'content-type': 'application/json' },
                            data: [{ index: 0, methodname: 'core_calendar_get_calendar_upcoming_view', args: { courseid: '1', categoryid: '0' } }]
                        })];
                    case 1:
                        upcomingEvents = _a.sent();
                        return [2 /*return*/, upcomingEvents.data[0].data.events];
                }
            });
        });
    };
    Session.prototype.getClasses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var classes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.apiRequest('POST', "/lib/ajax/service.php?sesskey=".concat(this.sesskey, "&info=core_course_get_enrolled_courses_by_timeline_classification"), {
                            headers: { 'content-type': 'application/json' },
                            data: [{ index: 0, methodname: 'core_course_get_enrolled_courses_by_timeline_classification', args: { offset: 0, limit: 0, classification: 'all', sort: 'fullname', customfieldname: '', customfieldvalue: '' } }]
                        })];
                    case 1:
                        classes = _a.sent();
                        return [2 /*return*/, classes.data[0].data.courses];
                }
            });
        });
    };
    return Session;
}());
exports.Session = Session;
