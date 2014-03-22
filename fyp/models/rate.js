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

function Rate(rate) {
  this.itemId = rate.itemId;
  this.listId = rate.listId;
  this.userId = rate.userId;
  this.rating = rate.rating;
};

module.exports = Rate;

//====================get a single rate information================
Rate.get = function(itemId, listId, userId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of rates
    db.collection('rates', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for rate(s) based on both itemId and userId
	  var query = {};
	  if(itemId){
		query.itemId = itemId;
	  }
	  if(listId){
		query.listId = listId;
	  }
	  if(userId){
		query.userId = userId;
	  }
      collection.findOne(query,function (err, rate) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, rate);
      });
    });
  });
};

//====================get all rate values of an item information================

Rate.getAllRate = function(itemId, listId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of rates
    db.collection('rates', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a list of values of an item
	  var query = {};
	  if(itemId){
		query.itemId = itemId;
	  }
	  if(listId){
		query.listId = listId;
	  }
      collection.find(query).sort({
		time: -1
      }).toArray(function (err, rates) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, rates);
      });
    });
  });
};

//====================update an rate information================
Rate.prototype.update = function(itemId, listId, userId, rating, callback) {

  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of rates
    db.collection('rates', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
	  var query = {};
	  if(itemId){
		query.itemId = itemId;
	  }
	  if(listId){
		query.listId = listId;
	  }
	  if(userId){
		query.userId = userId;
	  }
      //update rate information in the rate set
      collection.update(query,
	{$set:{"rating": rating, "lastUpdatedTime": time}},
	{safe: true, upsert: true
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

//====================delete an rate================
//delete an rate
Rate.remove = function(itemId, userId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get rates collection
    db.collection('rates', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //remove an rating called itemId and userId
      collection.remove({
        itemId: itemId,
		userId: userId
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