import {IonicApp, NavController, NavParams} from 'ionic-framework/ionic';
import {View} from 'angular2/core';
import {BsApi} from "../../services/api";

@View({
    templateUrl: 'build/pages/list/list.html',
    selector: 'left-menu'
})


export class LeftMenu {
    nav;

    constructor(private api:BsApi) {
        this.nav = [];
    }


}
