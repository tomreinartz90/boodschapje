import {Http, HTTP_PROVIDERS, Headers, RequestOptionsArgs} from '@angular/http';
import {Events} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { delay } from 'rxjs/operator/delay';


export class BsApi {
    URL:string = 'http://boodschappen.tomreinartz.com/api2/';
    public http:Http;
    public apiHeader:Headers;
    public storage:StorageApi;
    private requestOptionsArgs:RequestOptionsArgs;
    private gettingUpdates = false;

    constructor() {
        this.apiHeader = new Headers();
        this.storage = new StorageApi();
        this.requestOptionsArgs = {headers: this.apiHeader};
        //sest auth header
        this.setAuthHeader();
    }

    setAuthHeader(user?:User):void {
        if (user != undefined && user.loginHash != undefined)
            this.apiHeader.set('X-AUTH-TOKEN', user.loginHash);
        else if (this.storage.getUser() != null) {
            this.apiHeader.set('X-AUTH-TOKEN', this.storage.getUser().loginHash);
        }
    }


    login(email, password) {
        return this.http.get(this.URL + "login?email=" + email + "&password=" + password, this.requestOptionsArgs);
    }

    registerNewUser(username, password, email) {
        return this.http.post(this.URL + "account?email=" + email + "&password=" + password + "&username=" + username, null, this.requestOptionsArgs);
    }

    getLists() {
        console.log(this.requestOptionsArgs);
        return this.http.get(this.URL + "lists", this.requestOptionsArgs);
    }

    newList(name, cat) {
        return this.http.get(this.URL + "new-list?name=" + name + "&category=" + cat, this.requestOptionsArgs);
    }


    updateListItemCompleted(listItem:ListItem) {
        return this.http.put(this.URL + "listitems/" + listItem.id + "?&completed=" + listItem.completed, null, this.requestOptionsArgs).subscribe(resp => {}, error => {
            this.storage.addListItemToBeUpdated(listItem);
        });
    }

    getUpdates(timestamp) {
        return this.http.get(this.URL + "updates?timestamp=" + timestamp, this.requestOptionsArgs);
    }

    getSuggestion(itemName) {
        return this.http.get(this.URL + "suggestions?q=" + itemName, this.requestOptionsArgs);
    }

    addListItem(name, category, listid) {
        //http://boodschappen.tomreinartz.com/api2/listitems?category=1&listid=12&name=vla
        category = 1;
        return this.http.post(this.URL + "listitems?category=" + category + "&listid=" + listid + "&name=" + name, null, this.requestOptionsArgs);
    }


    getListUpdates(timestamp, callback) {
        var _self = this;
        var newTimestamp;
        if (!this.gettingUpdates) {

            this.gettingUpdates = true;
            this.getUpdates(timestamp).subscribe(function (resp) {
                _self.gettingUpdates = false;
                var res = resp.json();
                //console.log(resp.json());
                newTimestamp = res.timestamp;
                callback(_self.updateListItems(res.results), newTimestamp);
            });
        } else {
            callback(_self.storage.getLists(), timestamp);
        }

        if(this.storage.getListItemsToBeUpdated().length){
            this.storage.getListItemsToBeUpdated().forEach(listItem => {
                this.updateListItemCompleted(listItem)
            })
            this.storage.clearListItemsToBeUpdated();
        }
    }

    updateListItems(updatedListItems:Array<any>) {
        var _self = this;
        var lists = this.storage.getLists();
        if (updatedListItems.length > 0) {
            updatedListItems.forEach(function (updatedListItem) {
                var inList = false;
                //update list item
                lists.forEach(function (list) {
                    list.list_items.forEach(function (listItem, listitemid) {
                        if (listItem.id == updatedListItem.id) {
                            console.log(updatedListItems);
                            list.list_items[listitemid] = updatedListItem;
                            inList = true;
                        }
                    });
                });
                //add list item
                if (!inList) {
                    lists.forEach(function (list) {
                        if (updatedListItem.listid == list.listid) {
                            console.log(list.listid);
                            list.list_items.unshift(updatedListItem);
                        }

                    });
                }

            });
        }
        this.storage.setLists(lists);
        return lists;
    }

    //add new list by name
    addList(name:string) {
        var category = 1;
        return this.http.post(this.URL + "lists?category=" + category + "&name=" + name, null, this.requestOptionsArgs);
    }

    updateList(listId:number, name:string, category:string) {
        return this.http.put(this.URL + "lists/" + listId + "?category=" + category + "&name=" + name, null, this.requestOptionsArgs);
    }

    //remove list by id
    removeList(listid:number) {
        return this.http.delete(this.URL + "lists/" + listid, this.requestOptionsArgs);
    }

    //get share code for api
    shareList(listid:number) {
        return this.http.get(this.URL + "/lists/" + listid + "/share", this.requestOptionsArgs);
    }
}

export class StorageApi {

    get(name) {
        return JSON.parse(localStorage.getItem(name));
    }

    set(name, value) {
        return localStorage.setItem(name, JSON.stringify(value));
    }

    //get user information from storage
    getUser():User {
        return this.get('user');
    }

    //set user information
    setUser(user:User) {
        return this.set('user', user);
    }

    //get lists
    getLists() {
        return this.get('lists') || []
    }

    //set lists
    setLists(lists) {
        return this.set('lists', lists)
    }

    addListItemToBeUpdated(item:ListItem) {
        if (item)
            this.set('listItemsToBeUpdated', this.getListItemsToBeUpdated().push(item))
    }

    getListItemsToBeUpdated():Array<ListItem> {
        return this.get('listItemsToBeUpdated') || [];
    }


    //clear local data (logout)
    clearLocalData() {
        localStorage.clear();
    }

    clearListItemsToBeUpdated():void {
        this.set('listItemsToBeUpdated', []);
    }
}

export class User {
    name:string;
    userid:string;
    loginHash:string;
    sessionStarted:string;
    email:string;
    password:string;
}

export class List {
    category:string;
    list_items:Array<ListItem>;
    listid:string;
    name:string;
    userid:string;
}

export interface ListItem {
    addedBy: string;
    category: string;
    completed: boolean;
    completedBy: string;
    dateAdded: string
    id: string;
    last_updated: string;
    listid: string;
    name: string
}
//
