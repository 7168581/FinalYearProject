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
  this.itemList = list.itemList;
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
      itemList: this.itemList,
	  rate: this.rate,
	  info: this.info,
	  time: time
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
List.get = function(listId, callback) {
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
      collection.findOne({
        listId: listId
      }, function (err, list) {
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
//=======update list information=============
List.prototype.update = function(listName, info, itemList, callback) {
	console.log(info);
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
	  if(itemList){
		query.itemList = itemList;
	  }
	  collection.update(
	{"listName": listName},
	{"$set": query},
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

//=======add item into list=============
List.prototype.addToList = function(itemId, callback) {
  
  var list = {
      listName: this.listName,
      listId: this.listId,
	  userName: this.userName,
	  userId: this.userId,
      itemList: this.itemList,
	  rate: this.rate,
	  info: this.info,
	  time:time
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
	{"$addToSet": {"itemList": itemId}},
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