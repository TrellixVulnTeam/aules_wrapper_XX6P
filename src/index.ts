import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { HTMLElement, parse } from 'node-html-parser';
import { User, Event, Class, SessionOptions } from './definitions';
import { CookieJar } from 'tough-cookie'

const JSONtoFormDataString = (data: Object) : string => Object.entries(data).map(x => `${x[0]}=${x[1]}`).join('&');

export default this;
export class Session {
    private baseURL: string = 'https://aules.edu.gva.es';
    private sesskey: string = '';
    private options: SessionOptions;

    cookieJar: CookieJar = new CookieJar();
    request: AxiosInstance = axios.create();

    constructor (options: SessionOptions = {}) {
        this.options = options;

        if (options.useCookieJar) {
            this.request = wrapper(axios.create({ jar: this.cookieJar }));
            if (options.cookies) try {
                let cookies = JSON.parse(options.cookies);
                cookies.forEach((c: any) => this.cookieJar.setCookieSync(`${c.key}=${c.value}`, this.baseURL + c.path, { secure: true }));
            } catch {}
        }
    }

    private apiRequest(method: Method, url: string, options: AxiosRequestConfig = {}) : AxiosPromise {
        let req = this.request({
            method: method,
            url: this.baseURL + url,
            ...options
        })
        req.then(res => {
            if (typeof(res.data) == 'string')
                this.sesskey = res.data.match(/sesskey=(\w+)/)?.[1] ?? this.sesskey;
        });
        return req;
    }

    async login(course?: string, username?: string, password?: string) : Promise<any> {
        this.options.course = course ?? this.options.course;
        this.options.username = username ?? this.options.username;
        this.options.password = password ?? this.options.password;

        this.cookieJar.removeAllCookiesSync();

        let mainPageResponse = await this.apiRequest('GET', `/${this.options.course}/login/index.php`);
        let loginToken = parse(mainPageResponse.data).querySelector('[name="logintoken"]')?.getAttribute('value');

        let loginResponse = await this.apiRequest('POST', `/${this.options.course}/login/index.php`, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: JSONtoFormDataString({
                logintoken: loginToken,
                username: this.options.username,
                password: this.options.password
            })
        });

        let loginResponseDoc = parse(loginResponse.data);
        let usermenu = loginResponseDoc.querySelector('#usermenu');
        
        if (usermenu) {
            let events = loginResponseDoc.querySelectorAll('[data-region="event-item"]');

            return {
                success: true,
                cookies: JSON.stringify(this.cookieJar.toJSON().cookies),
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
            return {
                success: false,
                error: loginResponseDoc.querySelector('.alert.alert-danger')?.text
            }
        }
    }

    async isValid() : Promise<boolean> {
        let homePageDoc = parse((await this.apiRequest('GET', `/${this.options.course}/my`)).data);
        return homePageDoc.querySelector('#usermenu') ? true : false;
    }

    async getUserInfo() : Promise<User> {
        let userDoc = parse((await this.apiRequest('GET', `/${this.options.course}/user/profile.php`)).data);
        return {
            id: userDoc.querySelector('.contentnode.idnumber.aduseropt')?.lastChild.childNodes[1].text ?? '',
            name: userDoc.querySelector('.contentnode.fullname')?.text ?? '',
            email: userDoc.querySelector('.contentnode.email')?.lastChild.childNodes[1].text ?? '',
            profilePicture: userDoc.querySelector('.userpicture')?.getAttribute('src')?.replace('f2', 'f1') ?? '',
        }
    }

    async getEvents() : Promise<Event[]> {
        let upcomingEvents = await this.apiRequest('POST', `/${this.options.course}/lib/ajax/service.php?sesskey=${this.sesskey}&info=core_calendar_get_calendar_upcoming_view`, {
            data: [{ index: 0, methodname: 'core_calendar_get_calendar_upcoming_view', args: { courseid: '1', categoryid: '0' } }],
            headers: {
                'content-type': 'application/json'
            }
        });
        return upcomingEvents.data[0].data.events;
    }

    async getClasses() : Promise<Class[]> {
        let classes = await this.apiRequest('POST', `/${this.options.course}/lib/ajax/service.php?sesskey=${this.sesskey}&info=core_course_get_enrolled_courses_by_timeline_classification`, {
            data: [{ index: 0, methodname:'core_course_get_enrolled_courses_by_timeline_classification', args: { offset: 0, limit: 0, classification: 'all', sort: 'fullname', customfieldname: '', customfieldvalue: '' } }],
            headers: {
                'content-type': 'application/json'
            }
        });
        return classes.data[0].data.courses;
    }
}