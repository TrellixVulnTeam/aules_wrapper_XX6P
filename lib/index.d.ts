import { AxiosInstance } from 'axios';
import { User, Event, Class, SessionOptions } from './definitions';
interface Cookie {
    key: string;
    value: string;
}
declare class CookieJar {
    cookies: Cookie[];
    constructor();
    addCookie: (key: string, value: string) => void;
    removeCookie: (key: string) => Cookie[];
    addCookiesFromHeaders: (headers: any) => any;
    toString: () => string;
}
declare const _default: undefined;
export default _default;
export declare const Sessions: Session[];
export declare class Session {
    private baseURL;
    private sesskey;
    private options;
    request: AxiosInstance;
    cookieJar: CookieJar;
    constructor(options?: SessionOptions);
    private apiRequest;
    login(course?: string, username?: string, password?: string): Promise<any>;
    isValid(): Promise<boolean>;
    getUserInfo(): Promise<User>;
    getEvents(): Promise<Event[]>;
    getClasses(): Promise<Class[]>;
}
