import {Http, HTTP_PROVIDERS} from 'angular2/http';


export class BsApi {
    URL:string = 'http://boodschappen.tomreinartz.com/api/';
    constructor(public http:Http){
    }

    login(email, password){
        return this.http.get(URL + "login?email=" + email + "&password=" + password);
    }

    registerNewUser(username, password, email){
        return this.http.get(URL + "account?email=" + email + "&password=" + password + "&username=" + username);
    }

    getLists (){
        return this.http.get(URL + "lists");
    }

    newList(name, cat){
        return this.http.get(URL + "new-list?name=" + name + "&category=" + cat);
    }
}

export class Storage {

    get(name){
        return JSON.parse(localStorage.getItem(name) || '');
    }

    set(name, value){
        return localStorage.setItem(name, JSON.stringify(value));
    }

    //get user information from storage
    getUser(){
        return this.get('user');
    }
    //set user information
    setUser(user){
        return this.set('user', user);
    }
    //get lists
    getLists(){
        return this.get('lists')
    }
    //set lists
    setLists(lists){
        return this.set('lists', lists)
    }
    //clear local data (logout)
    clearLocalData(){
        localStorage.clear();
    }
}