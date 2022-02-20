import { AxiosInstance } from 'axios';
import { User, Event, Class, SessionOptions } from './definitions';
import { CookieJar } from 'tough-cookie';
declare const _default: undefined;
export default _default;
export declare class Session {
    private baseURL;
    private sesskey;
    private options;
    cookieJar: CookieJar;
    request: AxiosInstance;
    constructor(options?: SessionOptions);
    private apiRequest;
    login(course?: string, username?: string, password?: string): Promise<any>;
    isValid(): Promise<boolean>;
    getUserInfo(): Promise<User>;
    getEvents(): Promise<Event[]>;
    getClasses(): Promise<Class[]>;
}
