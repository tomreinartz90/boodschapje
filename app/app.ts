import {App, Platform, NavController, IonicApp} from 'ionic-framework/ionic';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Component} from 'angular2/core';

// https://angular.io/docs/ts/latest/api/core/Type-interface.html
import {Type} from 'angular2/core';

import {WelcomePage} from './pages/welcome/welcome';
import {ListPage} from './pages/list/list';
import {LeftMenu} from './components/leftMenu/leftMenu';
import {CreateAccount} from './pages/createAccount/createAccount';
import {LoginPage} from './pages/login/login';
import {BsApi, Storage} from './services/api';

@App({
  templateUrl: 'build/app.html',
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [BsApi, Storage, HTTP_PROVIDERS],
})

export class MyApp {
  rootPage: Type = WelcomePage;
  pages;
  constructor(public app: IonicApp, platform: Platform, bsApi:BsApi, storage:Storage, http:Http) {
    //setup connection to api
    bsApi.http = http;
    bsApi.setAuthHeader();
    this.pages = [
      { title: 'Lijsten', component: WelcomePage },
      { title: 'Login', component: LoginPage },
      { title: 'Create', component: CreateAccount }
    ];
    // set our app's pages
    platform.ready().then(() => {
      // The platform is now ready. Note: if this callback fails to fire, follow
      // the Troubleshooting guide for a number of possible solutions:
      //
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //
      // First, let's hide the keyboard accessory bar (only works natively) since
      // that's a better default:
      //
      // Keyboard.setAccessoryBarVisible(false);
      //
      // For example, we might change the StatusBar color. This one below is
      // good for dark backgrounds and light text:
      // StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
    });
  }

  public openPage(page, nav) {
    // close the menu when clicking a link from the menu
    this.app.getComponent('leftMenu').close();
    // navigate to the new page if it is not the current page
    nav.rootPage(page.component, {}, {});
  }

  public logOut(){
    this.app.getComponent('leftMenu').close();
    let nav = this.app.getComponent('nav');
    //clear user data
    localStorage.clear();
    //goto login page
    nav.rootPage(LoginPage, {}, {});
  }
}
