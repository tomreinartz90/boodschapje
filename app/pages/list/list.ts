import {NavParams, NavController, Page} from 'ionic-angular';
import {Component} from '@angular/core';

import {ItemDetailsPage} from "../item-details/item-details";
import {List} from "../../services/api";
import {BsApi} from "../../services/api";
import {EditList} from "../editList/editList";
import {StorageApi} from "../../services/api";

@Page({
    templateUrl: 'build/pages/list/list.html'
})


export class ListPage {
    nav:NavController;
    list:List;
    newListItemName:string = '';
    suggestions:Array<string> = [];

    constructor(nav:NavController, navParams:NavParams, public api:BsApi, private store:StorageApi) {
        this.nav = nav;
        // If we navigated to this page, we will have an item available as a nav param
        this.list = navParams.get('list');
        console.log(this.list);
    }

    itemTapped(event, item) {
        item.completed = !item.completed;
        this.api.updateListItemCompleted(item);
    }

    editItem(event, item) {
        this.nav.push(ItemDetailsPage, {
            item: item
        }, {});
    }

    editList() {
        this.nav.push(EditList, {
            list: this.list
        }, {});
    }

    doRefresh(refresher) {
        console.log('Refreshing!', refresher);
        var _this = this;
        this.api.getLists().subscribe(function (resp) {
            setTimeout(()=> {
                refresher.complete();
            }, 500);
            var res = resp.json();
            if (res.success) {
                res.results.forEach(function (list) {
                    if (list.listid == _this.list.listid)
                        _this.list = list;
                });
                this.store.setLists(res.results);

            }
        })
    }

    addListItem() {
        this.focusOnInput();
        var _this = this;
        if (this.newListItemName.length < 1)
            return;
        this.api.addListItem(this.newListItemName, this.list.category, this.list.listid).subscribe(function (resp) {
            if (resp.json().success) {
                _this.newListItemName = '';
                _this.suggestions = [];
                _this.list.list_items.unshift(resp.json().results[0]);
            }
        })
    }

    setSuggestion(suggestion:string) {
        this.focusOnInput();
        this.newListItemName = this.newListItemName.replace(this.lastword(this.newListItemName), suggestion);
    }

    focusOnInput() {
        //noinspection TypeScriptUnresolvedFunction
        //document.querySelector('#listitem-input input').focus();
    }


    getSuggestion(input:string) {
        this.newListItemName = input;
        var _this = this;
        if (input.length > 1) {
            this.api.getSuggestion(this.lastword(input)).subscribe((resp) => {
                console.log(resp.json());
                if (resp.status = 200)
                    _this.suggestions = resp.json().results;

            });
            console.log(input);
        } else {
            this.suggestions = [];
        }
    }

    lastword(words:string) {
        var array = words.split(' ');
        return array[array.length - 1];
    }
}
