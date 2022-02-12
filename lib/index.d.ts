import { AxiosInstance } from 'axios';
import { User, Event, Class } from './definitions';
declare const _default: undefined;
export default _default;
export declare const Sessions: Session[];
export declare class Session {
    private jar;
    private baseURL;
    private sesskey;
    request: AxiosInstance;
    constructor(cookie?: string);
    private apiRequest;
    login(course: string, username: string, password: string): Promise<any>;
    isSessionValid(): Promise<boolean>;
    getUserInfo(): Promise<User>;
    getEvents(): Promise<Event[]>;
    getClasses(): Promise<Class[]>;
}
