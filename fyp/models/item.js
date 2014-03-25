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
  this.listIdList = item.listIdList;
  this.listNameList = item.listNameList;
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
	  listIdList: this.listIdList,
	  listNameList: this.listNameList,
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
		query.listIdList = listId;
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

Item.getLimitNum = function(search_fields, page, limit, callback) {
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
	  var query = {};
		query = search_fields;
	  collection.count(query, function (err, total) {
		  collection.find(query, {
			skip: (page - 1) * limit,
			limit: limit
		  }).sort({
			time: -1
		  }).toArray(function (err, items) {
			mongodb.close();
			if (err) {
			  return callback(err);
			}
			callback(null, items, total);
		  });
		});
    });
  });
};

//====================update an item information================
Item.prototype.update = function(itemName, keyword, category, description, listIdList, listNameList, rate, callback) {

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
	  if(listIdList){
		query.listIdList = listIdList;
	  }
	  if(listNameList){
		query.listNameList = listNameList;
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

Item.prototype.multi_update = function(items, listId, listName, callback) {

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
	  for(var i = 0; i<items.length; i++){
		  collection.update(
			{"itemName":items[i].itemName},
			{"$addToSet": {"listIdList": listId, "listNameList": listName}, "$set":{"lastUpdatedTime":time}},
			{safe: true
			  }, function (err) {
			mongodb.close();
			if (err) {
			  return callback(err);
			}
		  });
		}
        callback(null);
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

Item.removeListInfo = function(listId, listName, callback) {
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
	var query = {};
	  if(listId){
		query.listIdList = listId;
	  }
	  if(listName){
		query.listNameList = listName;
	  }
	  console.log("query: " + JSON.stringify(query));
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