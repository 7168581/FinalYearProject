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
	  time: time,
	  description: this.description,
	  userName: this.userName,
	  userId: this.userId,
	  listInfo: this.listInfo,
	  rate: this.rate
  };
//	console.log(item.itemId);
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
Item.get = function(itemName, callback) {
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
      collection.findOne({
		itemName: itemName
      },function (err, item) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, item);
      });
    });
  });
};

Item.edit = function(itemId, callback) {
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
      //look for item(s) called itemId
      collection.findOne({
		itemId: itemId
      },function (err, item) {
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
Item.getAll = function(userName, callback) {
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
Item.prototype.update = function(callback) {

  var item = {
      itemName: this.itemName,
	  itemId: this.itemId,
      keyword: this.keyword,
      category: this.category,
	  time: time,
	  description: this.description,
	  userName: this.userName,
	  userId: this.userId,
	  listInfo: this.listInfo,
	  rate: this.rate
  };
  //open database
//  console.log(item);
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
      collection.update(
	{"itemName":item.itemName},
	item,
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