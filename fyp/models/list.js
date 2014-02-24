var mongodb = require('./db');

function List(list) {
  this.listName = list.listName;
  this.listId = list.listId;
  this.itemList = list.itemList;
  this.userName = list.userName;
  this.userId = list.userId;
};

module.exports = List;

//============store list information=====================
List.prototype.save = function(callback) {
var date = new Date();

var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }

  var list = {
      listName: this.listName,
      listId: this.listId,
	  time: time,
      itemList: this.itemList,
	  userName: this.userName,
	  userId: this.userId
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

//==============get list information====================
List.get = function(listName, callback) {
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
      //look for a list called 'listName'
      collection.findOne({
        listName: listName
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

//=======update list information=============
List.prototype.update = function(callback) {

var date = new Date();

var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  
  var list = {
      listName: this.listName,
      listId: this.listId,
	  time:time,
      itemList: this.itemList,
	  userName: this.userName,
	  userId: this.userId
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
	list,
	{safe: true
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