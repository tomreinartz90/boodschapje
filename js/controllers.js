/**
 */
controllers.controller('LoginController', function($scope,$rootScope,$state,$window,$document,getDataService, storeDataService){
  var _this = this;
  _this.name = false,
    _this.email = '',
    _this.emailPlaceholder = "mijn-email@gmail.com",
    _this.emailError = false,

    _this.password = '',
    _this.passwordPlaceholder = "**********",
    _this.passwordVisible = false,
    _this.passwordError = false,

    _this.loginError = false,
    _this.accountSuccess = false;


  //restore data
  var loginData = getDataService.byKey('login');
  if(loginData){
    _this.email = loginData.email;
    _this.name = loginData.name;
  }


  _this.login = function() { 
    if(_this.emailerror || _this.passwordError)
      _this.loginError = "Er is een fout opgetreden bij het aanmaken van uw account, probeer het nogmaals";
    else if(_this.email.length < 5 || _this.password.length < 6)
      _this.loginError = "Niet alle velden zijn volledig ingevuld";
    else 
      _this.loginError = false;

    //return if there is an error
    if(_this.loginError)
      return false;

    _this.loginSuccess = "Uw gegevens worden gecontrolleerd...";

    //ask api for login

    //store data in local storage

    //store login in local storage
    var login = { 
      name: _this.name,
      email: _this.email,
      secret: _this.password
    };
    storeDataService.perm('login', login);
    _this.accountSuccess = "Uw account is aangemaakt.";
    window.setTimeout(function(){ 
      $state.go('^.home');
    }, 850);
  }
});

controllers.controller('AccountCreationController', function($scope,$rootScope,$state,$window,$document,storeDataService){
  var _this = this;
  _this.name = '',
    _this.namePlaceholder = 'Tom Jones',
    _this.nameError = false,
    _this.nameSuccess = false,

    _this.email = '',
    _this.emailPlaceholder = "mijn-email@gmail.com",
    _this.emailerror = false,
    _this.emailSuccess = false,

    _this.password = '',
    _this.passwordPlaceholder = "**********",
    _this.passwordVisible = false,
    _this.passwordError = false,
    _this.passordSuccess = '',

    _this.accountError = false,
    _this.accountSuccess = false;

  _this.validateName = function(input) { 
    name = _this.name;
    console.log(name);
    if (name.length > 1){
      _this.nameSuccess = name;
      _this.nameError = false;
    }
    else
    {
      _this.nameSuccess = false;
      _this.nameError = "Uw naam moet uit minimaal 2 tekens bestaan"
    }
  };

  _this.validateEmail = function (input) { 
    var re = /\S+@\S+\.\S+/;
    var validated = re.test(_this.email);
    if(validated){
      _this.emailSuccess = _this.email;
      _this.emailError = false;
    }
    else
    {
      _this.emailSuccess = false;
      _this.emailError = _this.email + " is geen geldig email adress"
    }

  };

  _this.validatePassword = function (input) { 
    if(_this.password.length > 5){
      _this.passwordSuccess = true;
      _this.passwordError = false;
    }
  }

  _this.createAccount = function () { 
    if(_this.emailerror || _this.nameError || _this.passwordError)
      _this.accountError = "Er is een fout opgetreden bij het aanmaken van uw account, probeer het nogmaals";
    if(_this.email.length < 5 || _this.name.length < 2 || _this.password.length < 6)
      _this.accountError = "Niet alle velden zijn volledig ingevuld";

    //return if there is an error
    if(_this.accountError)
      //      return false;
      _this.accountSuccess = "Alles is in orde, uw account wordt aangemaakt.";

    //create new account via the API
    console.log(_this);

    //store login in local storage
    var login = { 
      name: _this.name,
      email: _this.email,
      secret: _this.password
    };
    storeDataService.perm('login', login);
    _this.accountSuccess = "Uw account is aangemaakt.";
    window.setTimeout(function(){ 
      $state.go('^.home');
    }, 850);
  }

});


controllers.controller('homeController', function($scope,$rootScope,$state,$window,$document,getDataService, listsService){
  var _this = this;
  _this.lists = new Object,
    _this.activeList = '',
    _this.name = '';

  _this.newlist = {
    name: '',
    category: 1,  
    categories: {},
    showForm: false
  }

  var loginData = getDataService.byKey('login');
  if(!loginData){
    $state.go('^.login');
    return;
  } 

  //fill data from services
  _this.newlist.categories = listsService.getCategories();
  _this.lists = listsService.getLists();
  _this.name = loginData.name;
  $scope.$on('lists-updated', function(events, lists){
    if(typeof args === 'object')
      _this.lists = args;
  })


  _this.addlist = function () {
    console.log(_this.newlist);
    if(_this.newlist.name.length > 2 ){
      listsService.newList(_this.newlist.name, _this.newlist.category);
      _this.newlist.name = '';
      _this.newlist.showForm = false;
    }
    //refresh lists
    _this.lists = listsService.getLists();
  }

  _this.totalListItems = function (list) { 
    var size = 0, key;
    for (key in list.listItems) {
      if (list.listItems.hasOwnProperty(key) && key.completed) size++;
    }
    return size;
  }

});


controllers.controller('ListController', function($scope,$rootScope,$state,$stateParams,$window,$document,getDataService, listsService){
  var loginData = getDataService.byKey('login');
  if(!loginData){
    $state.go('^.login');
    return;
  } 


  var _this = this
  listId =  $stateParams.id,
    _this.thisList = new Object,
    _this.activeList = '',
    _this.name = '';


  _this.addNewListItem = { 
    name: '',
    showForm: false
  };

  //fill data from services
  _this.thisList = listsService.getList(listId);
  _this.name = _this.thisList.name;

  _this.boodschappen = allProducts.filter(function(item, pos) {
    return allProducts.indexOf(item) == pos;
  });


  $scope.$on('lists-updated', function(events, lists){
    if(typeof lists === 'object'){
      _this.thisList = lists[listId]; 
    }
  });

  console.log(typeof _this.thisList)
  if(_this.thisList == false){
    $state.go('^.home');
  }

  _this.addlist = function () {
    if(_this.addNewListItem.name.length > 2 ){
      listsService.newListItem(listId, _this.addNewListItem.name, 1);
      //      _this.addNewListItem.showForm = false;
      _this.addNewListItem.name = '';
      //refresh lists
      _this.lists = listsService.getLists();
    }
  }

  _this.listitem = new Object();
  _this.listitem.complete = function (listItem) { 
    listItem.completed = !listItem.completed;
    listItem.completedBy = loginData.name;

    listsService.updateListItem(listItem.id, listItem);    
    console.log(listItem); 
  }

  _this.listitem.updateName = function (newName, listItem){ 
    if(newName !== undefined && newName.length > 2){
      listItem.name = newName;
      listsService.updateListItem(listItem.id, listItem);
    }
  }

});




//index products
//var products = []
//$('.product__description--title').each(function(key, value) {products.push($(value).text()) });
//console.log(products);
