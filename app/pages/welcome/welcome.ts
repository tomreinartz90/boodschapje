import {Page, NavController} from 'ionic-framework/ionic';

import {BsApi, Storage, List} from "../../services/api";
import {LoginPage} from "../login/login";
import {ListPage} from "../list/list";
import {CreateAccount} from "../createAccount/createAccount";

@Page({
    templateUrl: 'build/pages/welcome/welcome.html'
})
export class WelcomePage {
    lists:Array<List>;
    newListName:string = '';

    constructor(public nav:NavController, public storage:Storage, public api:BsApi) {
        if (this.checkIfUserHasBeenLoggedIn()) {
            this.getUserListFromStorage();
            this.getUserLists();
        }
    }

    checkIfUserHasBeenLoggedIn() {
        var _this = this;
        //if there is no user information available
        if (this.storage.getUser() == null) {
            setTimeout(function () {
                _this.nav.setRoot(LoginPage, {}, {});
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
        var _this = this;
        this.api.getLists().subscribe(function (resp) {
                var res = resp.json();
                if (res.success) {
                    _this.lists = res.results;
                    _this.storage.setLists(_this.lists);
                    _this.getListUpdates(res.timestamp);
                }
            },
            error => {
                if (error.status == 401)
                    _this.nav.setRoot(WelcomePage, {}, {});

            })
    }

    getListUpdates(timestamp) {
        var _this = this;
        this.api.getListUpdates(timestamp, function (lists, timestamp) {
            _this.lists = lists;
            setTimeout(function () {
                _this.getListUpdates(timestamp);
            }, 2000);
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
        var _this = this;
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
                _this.lists.push(list);
                //update global lists
                _this.storage.setLists(_this.lists);

                console.log(_this.lists);
                console.log(resp.json().results[0])

            },
            error => {
                console.log(error);
            })
    }
}
