var mongodb = require('./db');
var date = new Date();

var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  
function List(list) {
  this.listName = list.listName;
  this.listId = list.listId;
  this.userName = list.userName;
  this.userId = list.userId;
  this.itemIdList = list.itemIdList;
  this.itemNameList = list.itemNameList;
  this.rate = list.rate;
  this.info = list.info;
};

module.exports = List;

//============store list information=====================
List.prototype.save = function(callback) {

  var list = {
      listName: this.listName,
      listId: this.listId,
	  userName: this.userName,
	  userId: this.userId,
      itemIdList: this.itemIdList,
	  itemNameList: this.itemNameList,
	  rate: this.rate,
	  info: this.info,
	  addedTime: time,
	  lastUpdatedTime: time
  };
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of lists
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //insert a new list into the list set
      collection.insert(list, {
        safe: true
      }, function (err, list) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, list[0]);
      });
    });
  });
};

//==============get a single list information====================
List.get = function(listName, listId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of lists
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a list which its listId is 'listId'
	  var query = {};
	  if(listName){
		query.listName = listName;
	  }
	  if(listId){
		query.listId = listId;
	  }
      collection.findOne(query, function (err, list) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, list);
      });
    });
  });
};

//====================get all lists======================
List.getAll = function(userName, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of lists
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a list of lists created by a user called 'userName'
	  var query = {};
	  if(userName){
		query.userName = userName;
	  }
      collection.find(query).sort({
		time: -1
      }).toArray(function (err, lists) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, lists);
      });
    });
  });
};

List.getLimitNum = function(userName, listName, page, limit, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of lists
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a list of lists created by a user called 'userName'
	  var query = {};
	  if(userName){
		query.userName = userName;
	  }
	  if(listName){
		query.listName = listName;
	  }
	  collection.count(query, function (err, total) {
		  collection.find(query, {
			skip: (page - 1)*limit,
			limit: limit
		  }).sort({
			time: -1
		  }).toArray(function (err, lists) {
			mongodb.close();
			if (err) {
			  return callback(err);
			}
			callback(null, lists, total);
		  });
		});
    });
  });
};
//=======update list information=============
List.prototype.update = function(listName, info, itemIdList, itemNameList, rate, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of lists
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //update list information in the list set
      var query = {};
	  if(info){
		query.info = info;
	  }
	  if(itemIdList){
		query.itemIdList = itemIdList;
	  }
	  if(itemNameList){
		query.itemNameList = itemNameList;
	  }
	  if(rate){
		query.rate = rate;
	  }
	  query.lastUpdatedTime = time;
	  collection.update(
	{"listName": listName},
	{"$set": query},
	{safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

//=======add item into list=============
List.prototype.addToList = function(itemId, itemName, callback) {
  
  var list = {
      listName: this.listName
  };
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of lists
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //update list information in the list set
      collection.update(
	{"listName":list.listName},
	{"$addToSet": {"itemIdList": itemId, "itemNameList": itemName}, "$set":{"lastUpdatedTime":time}},
	{safe: true
      }, function (err, list) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

//====================delete an list================
//delete an list
List.remove = function(listId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get lists collection
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for an listId called 'listId'
      collection.remove({
        "listId": listId
      }, {
        w: 1
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

List.removeItemInfo = function(itemId, itemName, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get lists collection
    db.collection('lists', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
	var query = {};
	  if(itemId){
		query.itemIdList = itemId;
	  }
	  if(itemName){
		query.itemNameList = itemName;
	  }
      collection.update(query, {
        "$pull": query
      }, { multi: true }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};