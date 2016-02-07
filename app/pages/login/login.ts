import {Page, NavController} from 'ionic-framework/ionic';
import {BsApi, Storage, User} from "../../services/api";
import {WelcomePage} from "../welcome/welcome";

@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  busy:boolean = false;
  loginError:string = '';
  user:User;

  constructor( public api:BsApi, public storage:Storage, public nav: NavController) {
    console.log(api);
    this.user = new User();
    this.user.email = '';
    this.user.password = '';
  }

  doLogin(){
    this.busy = true;
    var _this = this;

    this.api.login(_this.user.email, _this.user.password).subscribe(function(resp){

      //if login is success
      var res = resp.json();
      if(res.success){
        _this.loginError = '';
        var userData = res.results[0];
        //update user model
        _this.user.loginHash = userData.hash;
        _this.user.name = userData.username;
        _this.user.sessionStarted = userData.sessionstarted;
        _this.user.userid = userData.userid;
        _this.user.password = ''; //clear password
        //store user information
        _this.storage.setUser(_this.user);
        //update header information
        _this.api.setAuthHeader();

        //navigate to main page
        _this.nav.setRoot(WelcomePage, {}, {});

      } else {
        //todo handle bad login
        _this.busy = false;
        _this.loginError = 'Fout tijdens inloggen'
      }

    });
  }
}


