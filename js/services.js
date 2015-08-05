// collection of services

services.factory('Yify', function($resource){
  url =  "https://yts.to/api/v2/list_movies.json";

  settings = {
    limit: "24", //max 50
    page: '@_page',
    minimum_rating: "@_minimum_rating", //vanaf IMDB rating 7
    sort_by: "@_sort_by",
    quality: "@_quality", //All, 720p 1080p 3D
    query_term: "@_query_term",
    genre: "@_genre",
    order_by: "desc" //desc asc //aflopend oplopend
  };

  return $resource( url  , settings, {
    get : {
      method: 'get',
      cache: false
    }
  });

}).service('storeDataService',function(){
  //temp will be loaded first, then perm memory will be loaded
  this.temp = function(key, value){ 
    var data = new Object();

    //check if key and value has been set
    if (!checkKeyAndValue(key, value)) { 
      console.warn("storing data requires the key: " + key + " and value: " + value + " to be set")
      return false;
    }

    //get storage
    data = JSON.parse(sessionStorage.getItem('data'));
    if(typeof data == 'undefined' || data == null)
      data = new Object();
    data[key] = value;
    //store data
    sessionStorage.setItem('data', JSON.stringify(data));
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
    data = JSON.parse(localStorage.getItem('data'));
    if(data === null)
      data = new Object();
    //change value
    if(data[key] === null){ 
      data[key] = ''; 
    }
    data[key] = value;
    //store data
    localStorage.setItem('data', JSON.stringify(data));
  }

  var checkKeyAndValue = function(key, value) { 
    return !((typeof key == undefined || typeof value === undefined) && key.length < 2 );
  }

  }).service('getDataService',function(){
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
}).service('listsService',function($rootScope, getDataService){
  _this = this;
  _this.getCategories = function () { 
    return {
      1: 'supermarkt',
      2: 'drogist',
      3: 'groentenboer',
      4: 'slager'
    } 
  }
  _this.getLists = function () { 
    var localData = new Object(),
        data = null;

    localData = JSON.parse(localStorage.getItem('lists'));
    //check if data is available
    if(localData !== 'undefined' && localData !== null){
      data = localData;
    }
    //if not data is stored return false
    if(typeof data === 'undefined' || data === null)
      return false;
    else
      return data;
  };
  _this.getList = function (listId) { 
    if (listId !== undefined){
      var lists = _this.getLists();
      list = lists[listId];
      if (list !== undefined) 
        return list;
      else return false;
    }
  }

  _this.newList = function (name, category) { 
    //get current lists
    var lists = _this.getLists();
    if (!lists)
      lists = new Object();
    var id = name + "-" + new Date().getTime();
    list = {
      id: id,
      name: name,
      category: category,
      listItems: {}
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

      //model
      var ListItem = function (name, category) { 
        return { 
          name: name,
          category: 1,  
          id: name + "-" + new Date().getTime(),
          addedBy: loginData.name,
          completedBy: '',
          completed: false,
          dateAdded: new Date().getTime()
        }
      }

      var loginData = getDataService.byKey('login');
      var listItem = new ListItem(listItemName, listItemCategory);
      var list = _this.getList(listId);
      var lists = _this.getLists();

      if (list !== undefined) { 
        list.listItems[listItem.id] = listItem;
        lists[listId] = list;
        storeLists(lists);
      }
    }
  }
  _this.updateListItem = function (listItemId, newListItem) { 
    var lists = this.getLists();
    //loop trough each list 
    angular.forEach(lists, function(list, listKey) {
      //loop trough each listitem
      angular.forEach(list.listItems, function(listitem, itemKey) {
        //make change when listitem is found
        if(listitem.id == listItemId){
          lists[listKey].listItems[itemKey] = newListItem;
          storeLists(lists);
        }
      });
    });
  }

  //private function
  storeLists = function (listsData) { 
    if (listsData === null || typeof listsData !== 'object')
      return false;

    localStorage.setItem('lists', JSON.stringify(listsData));
    //broadcast that lists have been updated
    $rootScope.$broadcast('lists-updated', listsData);
    console.log(listsData)
  }
});