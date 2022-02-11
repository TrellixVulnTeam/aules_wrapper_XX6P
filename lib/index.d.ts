import { AxiosInstance } from 'axios';
import { HTMLElement } from 'node-html-parser';
interface User {
    id: string | undefined;
    name: string | undefined;
    email: string | undefined;
    profilePicture: string | undefined;
}
interface QuickEvent {
    icon: string;
    title: string;
    time: string;
}
export declare const Sessions: Session[];
export declare class Session {
    private jar;
    private baseURL;
    request: AxiosInstance;
    constructor(cookie?: string);
    private apiRequest;
    login(course: string, username: string, password: string): Promise<any>;
    isSessionValid(): Promise<boolean>;
    getUserInfo(): Promise<User>;
    getEvents(personalAreaDoc?: HTMLElement): Promise<QuickEvent[]>;
}
export {};
