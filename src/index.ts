import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import { User, Event, Class, SessionOptions } from './definitions';

const JSONtoFormDataString = (data: Object) : string => Object.entries(data).map(x => `${x[0]}=${x[1]}`).join('&');

interface Cookie {
    key: string,
    value: string
}

class CookieJar {
    cookies: Cookie[] = [];

    constructor () {}

    addCookie = (key: string, value: string) => {
        let cookie = this.cookies.find(c => c.key == key);
        if (cookie) cookie.value = value;
        else this.cookies.push({ key, value });
    };
    removeCookie = (key: string) => this.cookies.splice(this.cookies.findIndex(c => c.key == key), 1);
    addCookiesFromHeaders = (headers: any) => headers['set-cookie'].forEach((c: any) => {
        let [key, value] = c.split(';')[0].split('=');
        if (value == 'deleted') this.removeCookie(key);
        else this.addCookie(key, value);
    });
    toString = () : string => this.cookies.map(c => `${c.key}=${c.value}`).join('; ');
}

export default this;
export const Sessions: Session[] = [];
export class Session {
    private baseURL: string = 'https://aules.edu.gva.es';
    private sesskey: string = '';
    private options: SessionOptions;

    request: AxiosInstance = axios.create();
    cookieJar: CookieJar = new CookieJar();

    constructor (options: SessionOptions = {}) {
        this.options = options;
        Sessions.push(this);

        if (options.cookie) {
            options.cookie.split(';').forEach(c => {
                let cookie = c.split('=');
                if (cookie[1])
                    this.cookieJar.addCookie(cookie[0], cookie[1]);
            });
        }
        if (options.course) {
            this.baseURL += `/${options.course}`;
        }
    }

    private apiRequest(method: Method, url: string, options: AxiosRequestConfig = {}) : AxiosPromise {
        let headers = options.headers ?? {};
        delete options.headers;
        
        return new Promise((resolve, reject) => {
            this.request({
                method: method,
                url: url,
                baseURL: this.baseURL,
                maxRedirects: 0,
                headers: {
                    cookie: this.cookieJar.toString(),
                    ...headers
                },
                ...options
            }).then(res => {
                if (typeof(res.data) == 'string')
                    this.sesskey = res.data.match(/sesskey=(\w+)/)?.[1] ?? this.sesskey;

                res.headers['set-cookie'] && this.cookieJar.addCookiesFromHeaders(res.headers);
                resolve(res);
            }).catch(async e => {
                let res: AxiosResponse = e.response;

                res.headers['set-cookie'] && this.cookieJar.addCookiesFromHeaders(res.headers);

                if (res.status == 303) {
                    resolve(await this.apiRequest('GET', res.headers.location));
                } else {
                    throw e;
                }
            });
        });
    }

    async login(course?: string, username?: string, password?: string) : Promise<any> {
        this.options.course = course ?? this.options.course;
        this.options.username = username ?? this.options.username;
        this.options.password = password ?? this.options.password;

        let oldCookieJar = this.cookieJar;
        this.cookieJar = new CookieJar();

        let mainPageResponse = await this.apiRequest('GET', `/${course}/login/index.php`);
        let loginToken = parse(mainPageResponse.data).querySelector('[name="logintoken"]')?.getAttribute('value');

        let loginResponse = await this.apiRequest('POST', `/${course}/login/index.php`, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: JSONtoFormDataString({
                logintoken: loginToken,
                username: username,
                password: password
            })
        });

        let loginResponseDoc = parse(loginResponse.data);
        let usermenu = loginResponseDoc.querySelector('#usermenu');
        
        if (usermenu) {
            this.baseURL = `https://aules.edu.gva.es/${course}`;

            let events = loginResponseDoc.querySelectorAll('[data-region="event-item"]');

            return {
                success: true,
                cookie: this.cookieJar.toString(),
                user: {
                    name: usermenu.text.trim(),
                    profilePicture: loginResponseDoc.querySelector('.userpicture')?.getAttribute('src')?.replace('f2', 'f1')
                },
                upcomingEvents: events.map((c) => ({
                    icon: (<HTMLElement> c.childNodes[1].childNodes[0]).getAttribute('src') ?? '',
                    title: c.childNodes[3].text,
                    time: c.childNodes[5].text
                }))
            }
        } else {
            this.cookieJar = oldCookieJar;
            return {
                success: false
            }
        }
    }

    async isValid() : Promise<boolean> {
        let homePageDoc = parse((await this.apiRequest('GET', '/my')).data);
        return homePageDoc.querySelector('#usermenu') ? true : false;
    }

    async getUserInfo() : Promise<User> {
        let userDoc = parse((await this.apiRequest('GET', '/user/profile.php')).data);
        return {
            id: userDoc.querySelector('.contentnode.idnumber.aduseropt')?.lastChild.childNodes[1].text ?? '',
            name: userDoc.querySelector('.contentnode.fullname')?.text ?? '',
            email: userDoc.querySelector('.contentnode.email')?.lastChild.childNodes[1].text ?? '',
            profilePicture: userDoc.querySelector('.userpicture')?.getAttribute('src')?.replace('f2', 'f1') ?? '',
        }
    }

    async getEvents() : Promise<Event[]> {
        let upcomingEvents = await this.apiRequest('POST', `/lib/ajax/service.php?sesskey=${this.sesskey}&info=core_calendar_get_calendar_upcoming_view`, {
            headers: { 'content-type': 'application/json' },
            data: [{ index: 0, methodname: 'core_calendar_get_calendar_upcoming_view', args: { courseid: '1', categoryid: '0' } }]
        });
        return upcomingEvents.data[0].data.events;
    }

    async getClasses() : Promise<Class[]> {
        let classes = await this.apiRequest('POST', `/lib/ajax/service.php?sesskey=${this.sesskey}&info=core_course_get_enrolled_courses_by_timeline_classification`, {
            headers: { 'content-type': 'application/json' },
            data: [{ index: 0, methodname:'core_course_get_enrolled_courses_by_timeline_classification', args: { offset: 0, limit: 0, classification: 'all', sort: 'fullname', customfieldname: '', customfieldvalue: '' } }]
        });
        return classes.data[0].data.courses;
    }
}