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
  
function User(user) {
  this.name = user.name;
  this.userId = user.userId;
  this.password = user.password;
  this.email = user.email;
  this.userType = user.userType;
};

module.exports = User;

//====================store user information================
User.prototype.save = function(callback) {
  var user = {
      name: this.name,
	  userId: this.userId,
      password: this.password,
      email: this.email,
	  userType: this.userType,
	  addedTime: time,
	  lastUpdatedTime: time
  };
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of users
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //insert a new user into the user set
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user[0]);
      });
    });
  });
};

//====================get a single user information================
User.get = function(name, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of users
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a user called 'name'
      collection.findOne({
        name: name
      }, function (err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};

//====================get all user information================
User.getAll = function(name, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the collection of users
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for a list of users
	  var query = {};
	  if(name){
		query.name = name;
	  }
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, users) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, users);
      });
    });
  });
};

//====================update a single user information================
User.prototype.update = function(name, userId, password, email, userType, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get the set of users
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //update user information in the user set
	  var query = {};
	  if(name){
		query.name = name;
	  }
	  if(password){
		query.password = password;
	  }
	  if(email){
		query.email = email;
	  }
	  if(userType){
		query.userType = userType;
	  }
	  query.lastUpdatedTime = time;
      collection.update(
	{"userId": userId},
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

//====================delete an user================
//delete an user
User.remove = function(userId, callback) {
  //open database
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //get user collection
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //look for an userId called 'userId'
      collection.remove({
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