import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import { User, Event, Class } from './interfaces';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const JSONtoFormDataString = (data: Object) : string => Object.entries(data).map(x => `${x[0]}=${x[1]}`).join('&');

export default this;
export const Sessions: Session[] = [];
export class Session {
    private jar = new CookieJar();
    private baseURL: string = 'https://aules.edu.gva.es';
    private sesskey: string = '';

    request: AxiosInstance = wrapper(axios.create({ jar: this.jar }));

    constructor (cookie: string = '') {
        cookie.split(';').forEach(c => {
            let cookie = c.split('=');
            cookie[1] && this.jar.setCookieSync(cookie[0], cookie[1]);
        });
        Sessions.push(this);
    }

    private apiRequest(method: Method, url: string, options: AxiosRequestConfig = {}) : AxiosPromise {
        let promise = this.request({
            method: method,
            url: url,
            baseURL: this.baseURL,
            ...options
        });
        promise.then(res => {
            if (typeof(res.data) == 'string')
                this.sesskey = res.data.match(/sesskey=(\w+)/)?.[1] ?? this.sesskey
        });
        return promise;
    }

    async login(course: string, username: string, password: string) : Promise<any> {
        let mainPageResponse = await this.apiRequest('GET', `/${course}/login/index.php`, { headers: {} });
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
            this.baseURL += `/${course}`;

            let events = loginResponseDoc.querySelectorAll('[data-region="event-item"]');

            return {
                success: true,
                cookie: this.jar.toJSON().cookies.map(c => `${c.key}=${c.value}`).join('; '),
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
                success: false
            }
        }
    }

    async isSessionValid() : Promise<boolean> {
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