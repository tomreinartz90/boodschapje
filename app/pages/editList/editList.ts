import {Page, NavController, NavParams, Alert} from 'ionic-angular';
import {BsApi} from "../../services/api";
import {WelcomePage} from "../welcome/welcome";

@Page({
  templateUrl: 'build/pages/editList/editList.html'
})
export class EditList {
  nav;
  selectedItem;
  name;

  constructor(nav: NavController,
              navParams: NavParams,
              public api:BsApi) {
    this.nav = nav;
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('list');
    console.log(this.selectedItem);
    this.name = this.selectedItem.name;
  }

  presentConfirmDelete() {
    var _self = this;
    //let alert = Alert.create({
    //  title: 'Bevestig verwijderen',
    //  message: 'Weet u zeker dat u deze lijst wilt verwijderen? Dit kan niet ongedaan worden gemaakt!',
    //  buttons: [
    //    {
    //      text: 'annuleer',
    //      handler: () => {
    //        console.log('Cancel clicked');
    //      }
    //    },
    //    {
    //      role: 'cancel',
    //      text: 'Verwijder',
    //      handler: () => {
    //        _self.deleteList();
    //        console.log('delete clicked');
    //      }
    //    }
    //  ]
    //});
    this.nav.present(alert);
  }

  updateList(){
    var _self = this;
    if(this.selectedItem.name != this.name) {
      this.selectedItem.name = this.name;
      this.api.updateList(this.selectedItem.listid, this.name, this.selectedItem.category).subscribe(success => {
        _self.nav.pop();
      })
    }
  }

  deleteList(){
    var _self = this;
    this.api.removeList(this.selectedItem.listid).subscribe(success => {
      if(success.json().success == true)
        _self.nav.setRoot(WelcomePage, {}, {});
    })
  }
}
