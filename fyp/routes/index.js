var crypto = require('crypto'),
	User = require('../models/user.js'),
	Item = require('../models/item.js'),
	ObjectId = require('mongodb').ObjectID,
	List = require('../models/list.js');
	Rate = require('../models/rate.js');

module.exports = function(app) {
  app.get('/', function (req, res) {
	Item.getAll(null, function(err,items){
		if(err){
		items = [];
	}
	List.getAll(null, function(err,lists){
		if(err){
		lists = [];
	}
    res.render('index', { 
	title: 'HomePage',
	user: req.session.user,
	items: items,
	lists: lists,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });
  });
 });
//==========================register=======================================
  app.get('/reg', noLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', { 
	title: 'Sign up',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });
  app.post('/reg', noLogin);
  app.post('/reg', function (req, res) {
	
//check if two passwords match.
	if(req.body.password != req.body.reEnterPassword){
		req.flash('error', 'Two passwords do not match');
		console.log('Two passwords do not match');
		return res.redirect('/reg');
	}

//produce md5
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
//produce userId
		var userId = new ObjectId();
	var newUser = new User({
		name: req.body.username,
		userId: userId,
		password: password,
		email: req.body.email,
		userType: "user"
	});
//check if the user exists
	User.get(req.body.username, function(err, user){
		if(user){
			req.flash('error','Username already exists');
			console.log('Username already exists');
			return res.redirect('/reg');
		}
//check if the user is an admin
			if(req.body.username == "admin"){
				newUser.userType = "admin";
			}
//if not in the database
		newUser.save(function(err,user){
			if(err){
				req.flash('error',err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success','Successfully register');
			console.log('successfully register');
			res.redirect('/');
		})
	})
  });
//==========================login=======================================
  app.get('/login', noLogin);
  app.get('/login', function (req, res) {
    res.render('login', { 
	title: 'Sign in',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
	});
  });
  app.post('/login', noLogin);
  app.post('/login', function (req, res) {
	var md5 = crypto.createHash('md5'),
	password = md5.update(req.body.password).digest('hex');
	User.get(req.body.username, function (err, user) {
	if (!user) {
		req.flash('error', 'User not exist'); 
		return res.redirect('/login');
	}
	if (user.password != password) {
		req.flash('error', 'Wrong password'); 
		return res.redirect('/login');
	}
    
	req.session.user = user;
	req.flash('success', 'Login successfully');
	res.redirect('/');
	});
});

//==========================logout=======================================
  app.get('/logout', isLogin);
  app.get('/logout', function (req, res) {
	req.session.user = null;
	req.flash('success', 'Logout successfully');
	res.redirect('/');
  });

//==========================reset password=======================================
  app.get('/reset', function (req, res) {
    res.render('reset', { 
	title: 'Reset Password',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });

  app.post('/reset', function (req, res) {

//admin password cannot be changed.
	if(req.body.username=="admin"){
		req.flash('error', 'The password of user "admin" cannot be changed');
		return res.redirect('/reset');
	}
	
//check if two passwords match.
	if(req.body.newPassword != req.body.reEnterNewPassword){
		req.flash('error', 'Two passwords do not match');
		return res.redirect('/reset');
	}

//produce md5
	var md5 = crypto.createHash('md5'),
		newPassword = md5.update(req.body.newPassword).digest('hex');

//check if the user exists
	User.get(req.body.username, function(err, user){
	if (!user) {
		req.flash('error', 'User not exist'); 
		return res.redirect('/reset');
	}
//in the database
	var newPasswordUser = new User({
		name: req.body.username,
		userId: user.userId,
		password: newPassword,
		email: user.email,
		userType: user.userType
	});
	newPasswordUser.update(function(err,user){
		if(err){
			req.flash('error',err);
			return res.redirect('/reset');
		}
		req.session.user = user;
		req.flash('success','Password reset successfully');
		res.redirect('/');
		});
	});
  });

//==========================add item=======================================
  app.get('/add-item', adminLogin);
  app.get('/add-item', function (req, res) {
    res.render('add-item', { 
	title: 'Add item',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });
  app.post('/add-item', adminLogin);
  app.post('/add-item', function (req, res) {
//produce itemId
	var itemId = new ObjectId();
//new item
	var	keyword = [req.body.keyword_1,req.body.keyword_2,req.body.keyword_3,req.body.keyword_4],
		newItem = new Item({
			itemName: req.body.itemName,
			itemId: itemId,
			keyword: keyword,
			category: req.body.category,
			description: req.body.description,
			userName: req.session.user.name,
			userId: req.session.user.userId,
			listInfo: "null",
			rate: "0"
		});

//check if the item exists
	Item.get(newItem.itemName, function(err, item){
		if(item){
			req.flash('error','Item already exists');
			return res.redirect('/add-item');
		}
//if not in the database
		newItem.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/add-item');
			}
			req.flash('success','Successfully added a new item');
			res.redirect('/add-item');
		});
	});
  });

//==========================user management=======================================
  app.get('/user-management', function (req, res) {
  
  	User.getAll(null, function(err,users){
		if(err){
		users = [];
	}
    res.render('user-management', { 
	title: 'User Management',
	user: req.session.user,
	users: users,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });
  });

  app.post('/user-management', function (req, res) {

//admin userType cannot be changed.
	if(req.body.username=="admin"){
		req.flash('error', 'The user-type of user "admin" cannot be changed');
		return res.redirect('/user-management');
	}

//in the database
	var newTypeUser = new User({
		name: req.body.username,
		userId: user.userId,
		password: user.password,
		email: user.email,
		userType: newUserType
	});
	newTypeUser.update(function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('/reset');
		}
		req.flash('success','user-Type changed successfully');
		res.redirect('/user-management');
	})
  });

//==========================edit an item=======================================

  app.get('/edit-item/:itemId', adminLogin);
  app.get('/edit-item/:itemId', function (req, res) {
	var itemId = new ObjectId(req.params.itemId);
	Item.edit(itemId, function(err, item){
	if(err){
		req.flash('error', err);
		return res.redirect('back');
	}
	if(!item){
		req.flash('error','Item not exist');
		return res.redirect('/');
	}
    res.render('edit-item', {
	title: 'Edit item',
	item: item,
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });
});
  app.post('/edit-item/:itemId', adminLogin);
  app.post('/edit-item/:itemId', function (req, res) {
	var itemId = new ObjectId(req.params.itemId);
	
	Item.edit(itemId, function(err, item){
//		console.log(item);
		var	keyword = [req.body.keyword_1,req.body.keyword_2,req.body.keyword_3,req.body.keyword_4];
		console.log(keyword);
		var editItem = new Item({
			itemName: item.itemName,
			itemId: item.itemId,
			keyword: keyword,
			category: req.body.category,
			description: req.body.description,
			userName: item.userName,
			userId: item.userId,
			listInfo: item.listInfo,
			rate: item.rate
		});
//		console.log(editItem);
		editItem.update(function(err,item){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','Successfully Edit!');
			res.redirect('/');
		});
	});
  });

//==========================delete an item=======================================
app.get('/delete-item/:itemId', adminLogin);
app.get('/delete-item/:itemId', function (req, res) {
	  var itemId = new ObjectId(req.params.itemId);
	  console.log(itemId);
	Item.remove(itemId, function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
    req.flash('success', 'Delete successfully!');
    res.redirect('/');
  });
});

//==========================give permission to an user=======================================
app.get('/permission/:userName', adminLogin);
app.get('/permission/:userName', function (req, res) {
    User.get(req.params.userName,function(err, user){
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
	if (!user) {
		req.flash('error', 'User not exist'); 
		return res.redirect('back');
	}
	var userType = user.userType;
	if(userType == "user"){
		userType = "admin";
	}else{
		userType = "user";
	}
//in the database
	var newPermissionUser = new User({
		name: user.name,
		userId: user.userId,
		password: user.Password,
		email: user.email,
		userType: userType
	});
	newPermissionUser.update(function(err,user){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		req.flash('success','Permission given successfully');
		res.redirect('/user-management');
		});
  });
  });
//==========================delete an user=======================================
app.get('/delete-user/:userName/:userId', adminLogin);
app.get('/delete-user/:userName/:userId', function (req, res) {
	  var userId = new ObjectId(req.params.userId);
	User.remove(userId, function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
    req.flash('success', 'Delete user: ' + req.params.userName + ' successfully!');
    res.redirect('/user-management');
  });
});

//==========================create list=======================================
  app.get('/add-list', adminLogin);
  app.get('/add-list', function (req, res) {
    res.render('add-list', { 
	title: 'Create List',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
    });
  });
  app.post('/add-list', adminLogin);
  app.post('/add-list', function (req, res) {
//produce listId
	var listId = new ObjectId();
	var itemList = [];
//new list
		newList = new List({
			listName: req.body.listName,
			listId: listId,
			userName: req.session.user.name,
			userId: req.session.user.userId,
			info: req.body.info,
			rate: "0",
			itemList: itemList
		});

//check if the list exists
	List.get(newList.listName, function(err, list){
		if(list){
			req.flash('error','list already exists');
			return res.redirect('/add-list');
		}
//if not in the database
		newList.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/add-list');
			}
			req.flash('success','Successfully created a new list');
			res.redirect('/add-list');
		});
	});
  });

//==========================AJAX to MongoDB=======================================
app.post('/add-rate', function(req, res){
	var itemId = req.body.itemId,
		userId = req.session.user.userId,
		rating = req.body.rating,
		itemId = new ObjectId(itemId),
		length = 1,
		rate = 0;
	
	var newRate = new Rate({
		itemId: itemId,
		userId: userId,
		rating: rating
	});
//store value of rating to database
	console.log("before");
	newRate.update(function(err){
		if(err){
			req.flash('error',err);
		}
		console.log("finish rating, successfully updated");
//get average value of a selected item and update to database.
	Rate.getItemRate(itemId, function(err, rates){
	if(err){
		req.flash('error', err);
		rates = [];
	}
	length = rates.length;
	
	Item.edit(itemId, function(err, item){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		if(!item){
			req.flash('error','Item not exist');
			return res.redirect('/');
		}
		if(length != 0){
			rate = item.rate;
			rate = (rate * (length - 1) + parseInt(rating))/length;
			console.log(rate);
			var ratedItem = new Item({
				itemName: item.itemName,
				itemId: item.itemId,
				keyword: item.keyword,
				category: item.category,
				description: item.description,
				userName: item.userName,
				userId: item.userId,
				listInfo: item.listInfo,
				rate: rate
			});
			ratedItem.update(function(err,item){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','Successfully rate it!');
			res.redirect('/');
			});
		}
    });
  });
});
	
console.log("end");
});

//==========================permission function=======================================
  function isLogin(req, res, next){
	if(!req.session.user) {
	req.flash('error', 'You are not logged in!');
	res.redirect('/login');
	}
	next();
  }

  function noLogin(req, res, next){
	if(req.session.user) {
	req.flash('error', 'You are already logged in!');
	res.redirect('back');
	}
	next();
  }
  
  function adminLogin(req, res, next){
  	if(!req.session.user) {
	req.flash('error', 'You are not logged in!');
	res.redirect('/login');
	}
	
	if(req.session.user) {
		if(req.session.user.userType!="admin"){
		req.flash('error', 'Sorry, you need a perimission to do this!');
		res.redirect('back');
		}
	}
	next();
  }

};

