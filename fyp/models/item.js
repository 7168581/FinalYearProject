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

function Item(item) {
  this.itemName = item.itemName;
  this.itemId = item.itemId;
  this.keyword = item.keyword;
  this.category = item.category;
  this.description = item.description;
  this.userName = item.userName;
  this.userId = item.userId;
  this.listInfo = item.listInfo;
  this.rate = item.rate;
};

module.exports = Item;

//====================store item information================
Item.prototype.save = function(callback) {
  var item = {
      itemName: this.itemName,
	  itemId: this.itemId,
      keyword: this.keyword,
      category: this.category,
	  description: this.description,
	  userName: this.userName,
	  userId: this.userId,
	  listInfo: this.listInfo,
	  rate: this.rate,
	  addedTime: time,
	  lastUpdatedTime: time
  };
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of items
    db.collection('items', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //insert a new item into the item set
      collection.insert(item, {
        safe: true
      }, function (err, item) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, item[0]);
      });
    });
  });
};

//====================get a single item information================
Item.get = function(itemName, itemId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of items
    db.collection('items', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for item(s) called itemName
	  var query ={};
	  if(itemName){
		query.itemName = itemName;
	  }
	  if(itemId){
		query.itemId = itemId;
	  }
      collection.findOne(
		query
      ,function (err, item) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, item);
      });
    });
  });
};

//====================get all items======================
Item.getAll = function(userName, listId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of items
    db.collection('items', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a list of items created by a user called 'userName'
	  var query = {};
	  if(userName){
		query.userName = userName;
	  }
	  if(listId){
		query.listInfo = listId;
	  }
      collection.find(query).sort({
		time: -1
      }).toArray(function (err, items) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, items);
      });
    });
  });
};

//====================update an item information================
Item.prototype.update = function(itemName, keyword, category, description, listInfo, rate, callback) {

//open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of items
    db.collection('items', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //update item information in the item set
	  var query = {};
	  if(itemName){
		query.itemName = itemName;
	  }
	  if(keyword){
		query.keyword = keyword;
	  }
	  if(category){
		query.category = category;
	  }
	  if(description){
		query.description = description;
	  }
	  if(listInfo){
		query.listInfo = listInfo;
	  }
	  if(rate){
		query.rate = rate;
	  }
	  query.lastUpdatedTime = time;
      collection.update(
	{"itemName":itemName},
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

//====================delete an item================
//delete an item
Item.remove = function(itemId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get items collection
    db.collection('items', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for an itemId called 'itemId'
      collection.remove({
        itemId: itemId
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