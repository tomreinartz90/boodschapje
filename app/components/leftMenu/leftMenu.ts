import {IonicApp, NavController, NavParams} from 'ionic-angular';
import {View} from '@angular/core';
import {BsApi} from "../../services/api";

@View({
    templateUrl: 'build/components/leftMenu/leftMenu.html',
    selector: 'left-menu'
})


export class LeftMenu {
    nav;

    constructor(private api:BsApi) {
        this.nav = [];
    }


}
