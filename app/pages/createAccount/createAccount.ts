import {Page, NavController} from 'ionic-framework/ionic';
import {BsApi, Storage, User} from "../../services/api";
import {WelcomePage} from "../welcome/welcome";
import {LoginPage} from "../login/login";

@Page({
  templateUrl: 'build/pages/createAccount/createAccount.html'
})
export class CreateAccount {
  busy:boolean = false;
  loginError:string = '';
  user:User;

  constructor( public api:BsApi, public storage:Storage, public nav: NavController) {
    this.user = new User();
    this.user.name = '';
    this.user.email = '';
    this.user.password = '';
  }

  canCreate(){
    return (this.user.name.length > 1 && this.user.email.length > 6 && this.user.password.length > 5);
  }

  create(){
    this.busy = true;
    var _this = this;
    if(!this.canCreate())
      return;
    _this.loginError = 'Uw gegevens worden gecontrolleerd';
    this.api.registerNewUser(_this.user.name, _this.user.password, _this.user.email).subscribe(function(resp){

      //if login is success
      var res = resp.json();
      console.log(res);
      if(res.success){
        _this.loginError = 'Lijsten klaarmaken';
        _this.storage.clearLocalData();
        _this.api.login(_this.user.email, _this.user.password).subscribe(success => {
              _this.loginError = '';

              var userData = success.json().results[0];
              //update user model
              _this.user.loginHash = userData.hash;
              _this.user.name = userData.username;
              _this.user.sessionStarted = userData.sessionstarted;
              _this.user.userid = userData.userid;
              _this.user.password = ''; //clear password
              //store user information
              _this.storage.setUser(_this.user);
              //update header information
              _this.api.setAuthHeader(_this.user);
              setTimeout(()=>{
                _this.nav.setRoot(WelcomePage, {}, {});
              }, 1500);
              //navigate to main page
            },
            error => {
              _this.loginError = 'Controlleer uw gegens.'
            });


      } else {
        //todo handle bad login
        _this.busy = false;
        _this.loginError = 'Controlleer uw gegens.'
      }

    }, error => {
      console.log(error);
      _this.loginError = 'Fout tijdens verbinden met server'

    });

  }
  gotoLogin(){
    this.nav.setRoot(LoginPage, {}, {});
  }
}


