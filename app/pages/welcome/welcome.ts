import {Page, NavController} from 'ionic-angular';

import {BsApi, StorageApi, List} from "../../services/api";
import {LoginPage} from "../login/login";
import {ListPage} from "../list/list";
import {CreateAccount} from "../createAccount/createAccount";

@Page({
    templateUrl: 'build/pages/welcome/welcome.html'
})
export class WelcomePage {
    lists:Array<List>;
    newListName:string = '';

    constructor(public nav:NavController, public storage:StorageApi, public api:BsApi) {
        if (this.checkIfUserHasBeenLoggedIn()) {
            this.getUserListFromStorage();
            this.getUserLists();
        }
    }

    checkIfUserHasBeenLoggedIn() {
        var _self = this;
        //if there is no user information available
        if (this.storage.getUser() == null) {
            setTimeout(function () {
                _self.nav.setRoot(LoginPage, {}, {});
                //
            }, 10);
            return false;
        } else {
            return true;
        }
    }

    getUserListFromStorage() {
        if (this.storage.getLists() != null)
            this.lists = this.storage.getLists();
    }

    getUserLists() {
        var _self = this;
        this.api.getLists().subscribe(function (resp) {
                var res = resp.json();
                if (res.success) {
                    _self.lists = res.results;
                    _self.storage.setLists(_self.lists);
                    _self.getListUpdates(res.timestamp);
                }
            },
            error => {
                if (error.status == 401)
                    _self.nav.setRoot(LoginPage, {}, {});

            })
    }

    getListUpdates(timestamp) {
        var _self = this;
        this.api.getListUpdates(timestamp, function (lists, timestamp) {
            _self.lists = lists;
            setTimeout(function () {
                _self.getListUpdates(timestamp);
            }, 50000);
        });

    }

    gotoList(event, list) {
        console.log('goto: ' + list.name);
        this.nav.push(ListPage, {
            list: list
        }, {});
    }

    getTotalIncomplete(list:Array<any>) {
        var total = 0;
        list.forEach(function (item) {
            if (!item.completed)
                total++;
        });
        return total;
    }

    addList() {
        var _self = this;
        if (this.newListName.length > 2) {
            this.api.addList(this.newListName).subscribe(resp => {
                    this.newListName = '';

                    var newList = resp.json().results[0];
                    var list = {
                        category: newList.category,
                        list_items: [],
                        listid: newList.category,
                        name: newList.name,
                        userid: newList.userid,
                    };

                    //update local lists
                    _self.lists.push(list);
                    //update global lists
                    _self.storage.setLists(_self.lists);

                    console.log(_self.lists);
                    console.log(resp.json().results[0])

                },
                error => {
                    console.log(error);
                })
        }
    }
}
