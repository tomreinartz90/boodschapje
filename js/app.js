/**
 */

angular.module('boodschapje',['ui.router','ngResource','ngAnimate','angular-toArrayFilter', 'angular.filter','boodschapje.controllers','boodschapje.services', 'autocomplete']);

angular.module('boodschapje').config(function($stateProvider,$filterProvider,$httpProvider,$sceDelegateProvider, $compileProvider){
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'https://www.youtube.com/**'
  ]);

  //whitelist magnet url's
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|magnet):/);

  //stateprovider 
  $stateProvider
    .state('login',{
    url:'/login',
    templateUrl:'partials/login.html'
  }).state('createAccount',{
    url:'/im-new',
    templateUrl:'partials/create-account.html'
  }).state('home',{
    url:'/home',
    templateUrl:'partials/home.html'
  }).state('viewList',{
    url:'/list/:id/view',
    templateUrl:'partials/list-view.html'
  });

}).run(function($state){
  $state.go('home');
});


//services
var services = angular.module('boodschapje.services',[]);

//controllers 
var controllers = angular.module('boodschapje.controllers',[]);

