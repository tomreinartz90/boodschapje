import {Component} from '@angular/core';
import {HTTP_PROVIDERS, Http} from '@angular/http';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {BsApi} from "./services/api";
import {WelcomePage} from "./pages/welcome/welcome";
import {ArrayType} from "../node_modules/@angular/compiler/src/output/output_ast";
import {NavController} from 'ionic-angular';
import {LoginPage} from "./pages/login/login";
import {StorageApi} from "./services/api";


@Component({
  templateUrl: 'build/app.html',
  providers: [BsApi, StorageApi, HTTP_PROVIDERS],

})
export class MyApp {

  private rootPage: any;
  pages:Array<any> = [];

  constructor( platform: Platform, bsApi:BsApi, http:Http) {
    this.rootPage = WelcomePage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
    //setup connection to api
    bsApi.http = http;
    bsApi.setAuthHeader();
    this.pages = [
      { title: 'Lijsten', component: WelcomePage },
      { title: 'Login', component: LoginPage },
      //{ title: 'Create', component: CreateAccount }
    ];
  }

  public openPage(page, nav) {
    // close the menu when clicking a link from the menu
    //this.app.getComponent('leftMenu').close();
    // navigate to the new page if it is not the current page
    nav.setRoot(page.component, {}, {});
  }

  public logOut(){
    //this.app.getComponent('leftMenu').close();
    //let nav = this.app.getComponent('nav');
    //clear user data
    localStorage.clear();
    //goto login page
    //nav.setRoot(LoginPage, {}, {});
  }
}

ionicBootstrap(MyApp);
