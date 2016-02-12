import {IonicApp, Page, Comp NavController, NavParams} from 'ionic-framework/ionic';
import {Component} from 'angular2/core';

import {ItemDetailsPage} from "../item-details/item-details";
import {List} from "../../services/api";
import {BsApi} from "../../services/api";
import {EditList} from "../editList/editList";

@Page({
  templateUrl: 'build/pages/list/list.html'
})


export class ListPage {
  nav:NavController;
  list:List;
  newListItemName:string = '';
  suggestions:Array<string> = [];

  constructor(app: IonicApp, nav: NavController, navParams: NavParams, public api:BsApi) {
    this.nav = nav;
    // If we navigated to this page, we will have an item available as a nav param
    this.list = navParams.get('list');
    console.log(this.list);
  }

  itemTapped(event, item){
    console.log(item);
    this.api.updateListItemCompleted(!item.completed, item.id).subscribe(function(resp){
      console.log(item);
      if(resp.json().success)
        item.completed = !item.completed;
    });
  }

  editItem(event, item) {
    console.log('You selected:', item.title);
    this.nav.push(ItemDetailsPage, {
      item: item
    }, {});
  }

  editList() {
    console.log('You selected:');
    this.nav.push(EditList, {
      list: this.list
    }, {});
  }

  doRefresh(refresher) {
    console.log('Refreshing!', refresher);
    var _this = this;
    this.api.getLists().subscribe(function(resp){
      refresher.complete();
      var res = resp.json();
      if(res.success){
        res.results.forEach(function(list){
          if(list.listid == _this.list.listid)
            _this.list = list;
        });
      }
    })
  }

  addListItem () {
    this.focusOnInput();
    var _this = this;
    if(this.newListItemName.length < 1)
      return;
    this.api.addListItem(this.newListItemName, this.list.category, this.list.listid).subscribe(function(resp){
      if(resp.json().success) {
        _this.newListItemName = '';
        _this.list.list_items.unshift(resp.json().results[0]);
        console.log(_this.list);
      }
    })
  }

  setSuggestion(suggestion:string){
    this.focusOnInput();
    this.newListItemName  = this.newListItemName.replace(this.lastword(this.newListItemName), suggestion);
  }

  focusOnInput(){
    //noinspection TypeScriptUnresolvedFunction
    document.querySelector('#listitem-input input').focus();
  }


  getSuggestion(input:string) {
    this.newListItemName = input;
    var _this = this;
    if(input.length > 1) {
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

  lastword(words:string){
    var array = words.split(' ');
    return array[array.length -1];
  }
}
