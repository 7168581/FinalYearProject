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
  this.userId = rate.userId;
  this.rating = rate.rating;
};

module.exports = Rate;

//====================store rate information================
Rate.prototype.save = function(callback) {
  var rate = {
	  itemId: this.itemId,
	  userId: this.userId,
	  rating: this.rating,
	  time: time
  };
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
      //insert a new rate into the rate set
      collection.insert(rate, {
        safe: true
      }, function (err, rate) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, rate[0]);
      });
    });
  });
};

//====================get a single rate information================
Rate.get = function(itemId, userId, callback) {
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
      collection.findOne({
		itemId: itemId,
		userId: userId
      },function (err, rate) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, rate);
      });
    });
  });
};

//====================update an rate information================
Rate.prototype.update = function(callback) {

  var rate = {
	  itemId: this.itemId,
	  time: time,
	  userId: this.userId,
	  rating: this.rating
  };
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
      //update rate information in the rate set
      collection.update(
	{"itemName":rate.itemName, userId:rate.userId},
	rate,
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