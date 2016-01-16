import {Http, HTTP_PROVIDERS} from 'angular2/http';


export class BsApi {
    
}

export class Storage {
    get(name){
        return localStorage.getItem(name).json() || {};
    }

    set(name, value){
        localStorage.setItem(name, value);
    }
}