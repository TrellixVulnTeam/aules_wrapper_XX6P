import { AxiosInstance } from 'axios';
import { User, Event, Class, SessionOptions } from './definitions';
declare const _default: undefined;
export default _default;
export declare const Sessions: Session[];
export declare class Session {
    private jar;
    private baseURL;
    private sesskey;
    private options;
    request: AxiosInstance;
    constructor(options?: SessionOptions);
    private apiRequest;
    login(course?: string, username?: string, password?: string): Promise<any>;
    isValid(): Promise<boolean>;
    getUserInfo(): Promise<User>;
    getEvents(): Promise<Event[]>;
    getClasses(): Promise<Class[]>;
}
