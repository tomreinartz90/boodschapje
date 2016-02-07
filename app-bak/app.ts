//import {App, IonicApp, Platform, NavController, Events} from 'ionic-framework/ionic';
import {App, Platform, Events, IonicApp} from 'ionic-framework/ionic';

import {WelcomePage} from './pages/welcome/welcome';
import {ListPage} from './pages/list/list';
import {LoginPage} from './pages/login/login';
import {BsApi, Storage} from './services/api';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Component} from 'angular2/core';


@App({
  templateUrl: 'build/app.html',
  providers: [BsApi, Storage, HTTP_PROVIDERS]
})

class MyApp {
  platform;
  pages;
  rootPage;
  constructor(private app: IonicApp, platform: Platform, bsApi:BsApi, storage:Storage, http:Http, events:Events) {

    // set up our app
    this.platform = platform;
    this.initializeApp();

    //setup connection to api
    bsApi.http = http;
    bsApi.setAuthHeader();
    storage.events = events;

    // set our app's pages
    this.pages = [
      { title: 'Lijsten', component: WelcomePage }
      //{ title: 'login', component: LoginPage },
      //{ title: 'My First List', component: ListPage }
    ];

    // make WelcomePage the root (or first) page
    this.rootPage = WelcomePage;
  }

  initializeApp() {
    var _this = this;
    this.platform.ready().then(() => {
      console.log('Platform ready');
    });
  }

  public openPage(page) {
    // close the menu when clicking a link from the menu
    this.app.getComponent('leftMenu').close();
    // navigate to the new page if it is not the current page
    let nav = this.app.getComponent('nav');
    nav.setRoot(page.component);

    nav.push(LoginPage, {}, {});
  }

  public logOut(){
    this.app.getComponent('leftMenu').close();
    let nav = this.app.getComponent('nav');
    //clear user data
    localStorage.clear();
    //goto login page
    nav.push(LoginPage, {}, {});
  }
}
