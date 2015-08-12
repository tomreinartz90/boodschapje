// collection of services

services.factory('apiService', function($q, $rootScope, $http, $state, $resource, getDataService, storeDataService){
  var _this = {};
  var url =  "http://nas.tomreinartz.com/slim/";

  function setHttpProviderCommonHeaderToken(){
    var loginData = getDataService.byKey('login')
    var token = loginData.token;
    $http.defaults.headers.common['X-AUTH-TOKEN'] = token;
    return;
  }  
  setHttpProviderCommonHeaderToken();

  var dataInterceptor = function (response) {
    var deferred = $q.defer();
    var responseData = response.data;
    if(responseData !== null){
      if(responseData.success){ 
        deferred.resolve(response.data);
      } else { 
        //handle errors from api
        var responseError = response.data.results[0];
        if(response.status == 401){ 
          $state.go('^.login');
          console.error(responseError);
        }
      }
    }
    return deferred.promise;
  }; 

  return $resource( url, {}, {
    login : {
      url: url + "login",
      method: 'get',
      cache: false,
      params: { 
        password: '@password', 
        email: '@email',
      },
      interceptor: {
        response: dataInterceptor,
        responseError: dataInterceptor
      },
      timeout: 500
    },
    getLists : { 
      url: url + "lists",
      method: 'get',
      cache: false,
      interceptor: {
        response: dataInterceptor,
        responseError: dataInterceptor
      },
      timeout: 500
    },
    newListItem : { 
      url : url + "new-list-item",
      method: 'get',
      params: { 
        name: '@name',
        category: '@category',
        listid: '@listid'
      },
      interceptor: {
        response: dataInterceptor,
        responseError: dataInterceptor
      },
      timeout: 500
    },    
    updateListItem : { 
      url : url + "update-list-item",
      method: 'post',
      params: { 
        name: '@name',
        completed: '@completed',
        listitemid: '@listitemid'
      },
      interceptor: {
        response: dataInterceptor,
        responseError: dataInterceptor
      },
      timeout: 500,
    },
    getUpdates : { 
      url : url + "updates",
      method: 'get',
      params: { 
        timestamp: '@timestamp'
      },
      interceptor: {
        response: dataInterceptor,
        responseError: dataInterceptor
      },
      timeout: 500,
    }
  });


}).service('storeDataService',function($rootScope){
  //temp will be loaded first, then perm memory will be loaded
  this.temp = function(key, value){ 
    var data = new Object();

    //check if key and value has been set
    if (!checkKeyAndValue(key, value)) { 
      console.warn("storing data requires the key: " + key + " and value: " + value + " to be set")
      return false;
    }

    //get storage
    data = $rootScope.data || JSON.parse(sessionStorage.getItem('data'));
    if(typeof data == 'undefined' || data == null)
      data = new Object();
    data[key] = value;
    //store data
    sessionStorage.setItem('data', JSON.stringify(data));
    data
  }
  //this will be loaded at last
  this.perm = function(key, value){
    var data = new Object();
    //check if key and value has been set
    if (!checkKeyAndValue(key, value)) { 
      console.warn("storing data requires the key: " + key + " and value: " + value + " to be set")
      return false;
    }

    //get storage
    if(data === null)
      data = new Object();
    //change value
    if(data[key] === null){ 
      data[key] = ''; 
    }
    data[key] = value;
    //store data
    localStorage.setItem('data', JSON.stringify(data));
    return true;
  }

  var checkKeyAndValue = function(key, value) { 
    return !((typeof key == undefined || typeof value === undefined) && key.length < 2 );
  }

  }).service('getDataService',function($rootScope){
  this.byKey = function (key) { 
    var sessionStored = false,
        sessionData = new Object(),
        localStored = false,
        localData = new Object(),
        data = null;

    sessionData = JSON.parse(sessionStorage.getItem('data'));
    localData = JSON.parse(localStorage.getItem('data'));
    //check if data is available in session storage
    if(typeof sessionData !== 'undefined' && sessionData !== null){
      if(typeof sessionData[key] !== 'undefined' && sessionData[key] !== null){
        data = sessionData[key];
        sessionStored = true;
      }
    }
    else if(localData !== 'undefined' && localData !== null){
      if(typeof localData[key] !== undefined && localData[key] !== null){
        data = localData[key];
        localStored = true;
      }
    }

    //if not data is stored return false
    if( (!sessionStored || !localStored) && typeof data === undefined)
      return false;
    else
      return data;
  }
}).service('listsService',function($rootScope, getDataService, apiService){
  _this = this;
  _this.getCategories = function () { 
    return {
      1: 'supermarkt',
      2: 'drogist',
      3: 'groentenboer',
      4: 'slager'
    } 
  }
  _this.getLatestListFromApi = function () { 
    //login is successfull lets update the lists
    var listData = apiService.getLists();
    listData.$promise.then(function(apiData){
      if(apiData.success) {
        storeLists(apiData.results);
        if(_this.gettingUpdatesFromApi == false)
          _this.getUpdatesFromApi(apiData.timestamp);
      } 
    });
  };
  _this.gettingUpdatesFromApi = false;
  _this.getUpdatesFromApi =  function (timestamp) { 
    _this.gettingUpdatesFromApi = true;
    var updateData = apiService.getUpdates({timestamp: timestamp});
    updateData.$promise.then(function(apiData){
      if(apiData.success) {
        setTimeout(function() { 
          var lists = _this.getLists();
          angular.forEach(apiData.results, function(updatedListItem) {
            //all lists
            _this.updateLocalListItem(updatedListItem);
          });

          _this.getUpdatesFromApi(apiData.timestamp);
        }, 5000);
      }
    });
  }


  _this.getLists = function () { 
    var localData = new Object(),
        data = null;
    //no connection, get local data;
    localData = JSON.parse(localStorage.getItem('lists'));
    //check if data is available
    if(localData !== 'undefined' && localData !== null){
      data = localData;
    }
    //if not data is stored return false
    if(typeof data === 'undefined' || data === null)
      return(false);
    else
      return(data);

  };
  _this.getList = function (listId) { 
    if (listId !== undefined){
      var listsData = _this.getLists();
      list = null;
      angular.forEach(listsData, function(value, key) {
        if(value !== undefined && value !== null ){
          if(Number(value.listid) == listId)
            list = value;
        }
      });
      if (list !== null)
        return list;
      else
        return(false);
    }
  }

  _this.newList = function (name, category) { 
    //get current lists
    //    var lists = _this.getLists();
    if (!lists)
      lists = new Object();
    var id = name + "-" + new Date().getTime();
    list = {
      id: id,
      name: name,
      category: category,
      list_items: {}
    }
    //only store if list is undefined
    if(typeof lists[id] === 'undefined')
      lists[id] = list;
    else { 
      id = name + "-" + new Date().getTime();
      list.id = id;
      lists[id] = list;
    }


    //store lists in localstorage
    storeLists(lists);

    return lists;
  };

  _this.newListItem = function (listId, listItemName, listItemCategory) { 
    if(listId !== undefined && typeof listItemName !== 'undefined' && typeof listItemCategory !== 'undefined'){

      var loginData = getDataService.byKey('login');

      var newListItem = apiService.newListItem({
        name: listItemName, 
        category: listItemCategory, 
        listid: listId,
      });
      newListItem.$promise.then(function(data) {
        var listItem = data.results[0];
        _this.updateLocalListItem(listItem);
      });
    }
  } 

  /*
  ** update listitem on database and update local listitem
  **  @param listItemId: int, id of listitem
  **  @param newListItem: object of key, value pairs of values that need to be updated
  */

  _this.updateListItem = function (listItemId, newListItem) { 
    var lists = this.getLists();

    newListItem.listitemid = listItemId;
    //ask api for update
    var updateListItem = apiService.updateListItem(newListItem);
    updateListItem.$promise.then(function(data){
      if(updateListItem.success){
        _this.updateLocalListItem(updateListItem.results[0]);
      }
    });
  }

  _this.updateLocalListItem = function(newListItem) { 
    var lists = this.getLists();
    var success = false;
    angular.forEach(lists, function(list, listKey) {
      //loop trough each listitem
      if(list.listid == newListItem.listid){
        angular.forEach(list.list_items, function(listitem, itemKey) {
          //make change when listitem is found
          if(listitem.id == newListItem.id){
            lists[listKey].list_items[itemKey] = newListItem;
            storeLists(lists);
            success = true;
          } 

        });
        //insert listitem if it was not found
        if(!success){
          if(lists[listKey].list_items == undefined)
            lists[listKey].list_items = [];

          lists[listKey].list_items.push(newListItem);
          storeLists(lists);
        }
      }
    });
  }

  //private function
  storeLists = function (listsData) { 
    if (listsData === null || typeof listsData !== 'object')
      return false;

    localStorage.setItem('lists', JSON.stringify(listsData));
    //broadcast that lists have been updated
    $rootScope.$broadcast('lists-updated', listsData);

    console.log("list updated");
    console.log(listsData);
  }
});