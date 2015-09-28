/**
 */
controllers.controller('LoginController', function($scope,$rootScope,$state,$window,$document,getDataService,apiService, storeDataService){
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
    var loginViaApi = apiService.login({email: _this.email, password: _this.password});
    loginViaApi.$promise.then(function(data) {
      if(data.success){
        localStorage.removeItem('data');
        localStorage.removeItem('lists');
        _this.accountSuccess = "Login succesvol.";
        //store login in local storage
        var login = { 
          email: _this.email,
          name: data.results[0].username,
          token: data.results[0].hash,
        };
        //store data in local storage
        storeDataService.perm('login', login);

        window.setTimeout(function(){ 
          $state.go('^.home');
        }, 50);
      }

    });
  }
});

controllers.controller('AccountCreationController', function($scope,$rootScope,$state,$window,$document,storeDataService, apiService){
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
      username: _this.name,
      email: _this.email,
      password: _this.password
    };


    var newUser = apiService.newUser(login);
    newUser.$promise.then(function(data){
      //      localStorage.deleteItem('login');
      login.password = null;
      storeDataService.perm('login', login);

      _this.accountSuccess = "Uw account is aangemaakt.";

      window.setTimeout(function(){ 
        $state.go('^.home');
      }, 1250);    
    });

  }

});


controllers.controller('homeController', function($scope,$rootScope,$state,$window,$document,getDataService,storeDataService,apiService,listsService){
  var _this = this;
  _this.lists = new Object,
    _this.activeList = '',
    _this.name = '',
    _this.class = '';

  _this.newlist = {
    name: '',
    category: 1,  
    categories: {},
    showForm: false
  }

  var loginData = getDataService.byKey('login');

  //login is successfull lets update the lists
  listsService.getLatestListFromApi();

  //fill data from services
  _this.newlist.categories = listsService.getCategories();
  _this.lists = listsService.getLists();
  _this.name = loginData.name;
  $scope.$on('lists-updated', function(events, lists){
    _this.lists = lists;
  })


  _this.addlist = function () {
    if(_this.newlist.name.length > 2 ){
      listsService.newList(_this.newlist.name, _this.newlist.category);
      _this.newlist.name = '';
      _this.newlist.showForm = false;
    }
    //refresh lists
  }

  _this.totalListItems = function (list) { 
    var size = 0, key;
    for (key in list.list_items) {
      if (!list.list_items[key].completed){
        size++;
      }
    }
    return size;
    return list.list_items.length;
  }

  _this.showList = function (list) { 
    console.log(list);
    list.class = "selected";
    window.setTimeout(function(){
      $state.go('viewList', {id:list.listid});
    }, 300);
  }

});


controllers.controller('ListController', function($scope,$rootScope,$state,$stateParams,$window,$document,getDataService, listsService,apiService){
  var loginData = getDataService.byKey('login');
  if(!loginData){
    $state.go('^.login');
    return;
  } 


  var _this = this
  _this.thisList = {name: ''};
  listId =  $stateParams.id,
    _this.thisList = new Object,
    _this.activeList = '',
    _this.name = '';

  _this.filter = function(){ 
    return false; 
  }

  _this.username = loginData.name;


  _this.addNewListItem = { 
    name: '',
    showForm: false
  };

  //use data from service first
  listsService.getLatestListFromApi();

  var allProducts = [];
  _this.boodschappen = allProducts.filter(function(item, pos) {
    return allProducts.indexOf(item) == pos;
  });

  $scope.$on('lists-updated', function(events, lists){
    //update available list items
    var newList = listsService.getList($stateParams.id);
    angular.forEach(newList.list_items, function(newListItem, newListKey){
      inlist = false;
      angular.forEach(_this.thisList.list_items, function(listItem, listKey){
        if(listItem.id == newListItem.id){
          inlist = true;
          if(newListItem.last_updated > listItem.last_updated){
            _this.thisList.list_items[listKey] = newListItem;
          }
        }
      });
      if(!inlist){
        var newList = [];
        newList.push(newListItem);
        _this.thisList.list_items = newList.concat(_this.thisList.list_items); 
      }
    });

  });

  var getList = function() { 
    data = listsService.getList($stateParams.id);
    _this.name = data.name;
    data.list_items.sort(listComparator);
    console.log(data);
    _this.thisList = data;
  }
  getList();

  // comparator to sort seasons by seasonNumber
  function listComparator(a, b) {
    //group
    if (a.completed != b.completed) {
      if (a.completed < b.completed)
        return -1;
      if (a.completed > b.completed)
        return 1;
      return 0;
    }
    //order
    if (a.dateAdded > b.dateAdded)
      return -1;
    if (a.dateAdded < b.dateAdded)
      return 1;
    return 0;
  }



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
  //holder for listitem methods
  _this.listitem = new Object();


  /*
  ** get suggestions from api
  ** param q = input
  */
  _this.getSuggestions = function (input) {
    //    console.log(input);
    _this.suggestions = [];
    if(input.length > 1){
      var suggestions = apiService.getSuggestions({q: input});
      suggestions.$promise.then(function(data) {
        console.log(data.results);
        _this.suggestions = data.results;
      });
    }
  };

  /*
  ** set listitem completed state to !completed state
  ** @param listItem: object, original listitem
  */
  _this.listitem.complete = function (listItem) { 
    //real update
    var update = { 
      completed: !listItem.completed
    };
    //    fake success
    angular.forEach(_this.thisList.list_items, function(item, key){
      if(item.id == listItem.id){ 
        console.log(_this.thisList.list_items[key]);
        _this.thisList.list_items[key].completed = update.completed;
      }
    });

    listsService.updateListItem(listItem.id, update);    
  }

  /*
  ** set listitem name to newName
  ** @param listItem: object, original listitem
  ** @param name: string, new name for listitem
  */
  _this.listitem.updateName = function (newName, listItem){ 
    if(newName !== undefined && newName.length > 2){
      var update = { 
        name: newName
      }
      listsService.updateListItem(listItem.id, update);
    }
  }

});




//index products
//var products = []
//$('.product__description--title').each(function(key, value) {products.push($(value).text()) });
//console.log(products);
