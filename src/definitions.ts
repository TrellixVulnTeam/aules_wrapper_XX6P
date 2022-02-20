export default this;

export interface SessionOptions {
    course?: string,
    username?: string,
    password?: string,
    cookies?: string,
    useCookieJar?: boolean
}

export interface User {
    id: string ,
    name: string,
    email: string,
    profilePicture: string,
}

export interface Event {
    id: number,
    name: string,
    description: string,
    modulename: string,
    instance: number,
    eventtype: string,
    timestart: number,
    timeduration: number,
    timesort: number,
    visible: number,
    timemodified: number,
    icon: Icon,
    course: Class,
    formattedtime: string,
    isactionevent: boolean,
    iscourseevent: boolean,
    iscategoryevent: boolean,
    groupname: object,
    normalisedeventtype: string,
    normalisedeventtypetext: string,
    action: Action,
    url: string,
    islastday: boolean,
    popupname: string
}

export interface Icon {
    key: string,
    component: string,
    alttext: string
}

export interface Action {
    name: string,
    url: string,
    itemcount: number,
    actionable: boolean,
    showitemcount: boolean
}

export class Class {
    id!: number;
    fullname!: string;
    shortname!: string;
    idnumber!: string;
    summary!: string;
    summaryformat!: number;
    startdate!: number;
    enddate!: number;
    visible: boolean = false;
    fullnamedisplay!: string;
    viewurl!: string;
    courseimage!: string;
    progress!: number;
    hasprogress: boolean = false;
    isfavourite: boolean = false;
    hidden: boolean = false;
    showshortname: boolean = false;
    coursecategory!: string;

    constructor (classData: Object) {
        Object.assign(this, classData)
    }

    async getResources() : Promise<Resource> {
        return {}
    }
}

class Resource {

}