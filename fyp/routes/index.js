var crypto = require('crypto'),
	User = require('../models/user.js'),
	Item = require('../models/item.js'),
	ObjectId = require('mongodb').ObjectID,
	List = require('../models/list.js'),
	Rate = require('../models/rate.js');
	
var fields = {},
	listName = null,
	userName = null;

module.exports = function(app) {
  app.get('/', function (req, res) {
  
	var item_page = req.query.item_p ? parseInt(req.query.item_p):1,
		list_page = req.query.list_p ? parseInt(req.query.list_p):1,
		titleName = req.session.titleName,
		limit = 10;
		
  	Item.getLimitNum(fields, item_page, limit, function(err,items,item_total){
		if(err){
			items = [];
		}
	List.getLimitNum(userName, listName, list_page, limit, function(err,lists,list_total){
		if(err){
			lists = [];
		}
		if(req.session.listType != "auto"){
			req.session.items = items;
		}
		req.session.lists = lists;
		req.session.item_page = item_page;
		req.session.itemFirstPage = (item_page - 1) == 0,
		req.session.itemLastPage = ((item_page - 1)*limit + req.session.items.length) == item_total,
		req.session.list_page = list_page;
		req.session.listFirstPage = (list_page - 1) == 0,
		req.session.listLastPage = ((list_page - 1)*limit + req.session.lists.length) == list_total,
  
		res.render('index', {
			title: 'HomePage',
			user: req.session.user,
			items: req.session.items,
			lists: req.session.lists,
			item_page: req.session.item_page,
			list_page: req.session.list_page,
			itemFirstPage: req.session.itemFirstPage,
			itemLastPage: req.session.itemLastPage,
			listFirstPage: req.session.listFirstPage,
			listLastPage: req.session.listLastPage,
			titleName: titleName,
			listType: req.session.listType,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
		});
	});
 });
 
//==========================show all items=======================================
app.get('/all-items', function(req, res){
//show all items to the homepage
	userName = null;
	req.session.listId = null;
	req.session.titleName = "All items";
	req.session.listType = "none";
	fields = {};
	listName = null;
	res.redirect('/');
});

//==========================get single item rate=======================================
app.post('/show-rate', function(req, res){
//show all rates to the homepage
	var itemId = req.body.itemId,
		listId = req.body.listId,
		userId = req.body.userId;
		
	Rate.get(itemId, listId, userId, function(err,rate){
		if(err){
			rate = null;
		}
		if(rate != null){
			res.send({rating: rate.rating});
		}else{
			res.send({rating: 0});
		}
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
			res.redirect('/all-items');
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
	res.redirect('/all-items');
	});
});

//==========================logout=======================================
  app.get('/logout', isLogin);
  app.get('/logout', function (req, res) {
	req.session.user = null;
	req.session.items = [];
	req.session.lists = [];
	req.session.listType = "none"
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
	var userId = user.userId;
	newPasswordUser.update(null, userId, newPassword,null,null,function(err,user){
		if(err){
			req.flash('error',err);
			return res.redirect('/reset');
		}
		req.session.user = user;
		req.flash('success','Password reset successfully');
		res.redirect('/all-items');
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
	var listNameList = new Array(),
		listIdList = new Array();
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
			listNameList: listNameList,
			listIdList: listIdList,
			rate: "0"
		});

//check if the item exists
	Item.get(newItem.itemName, null, function(err, item){
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
app.get('/user-management', adminLogin);
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

//==========================edit an item=======================================
  app.get('/edit-item/:itemId', adminLogin);
  app.get('/edit-item/:itemId', function (req, res) {
	var itemId = new ObjectId(req.params.itemId);
	Item.get(null, itemId, function(err, item){
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
	
	Item.get(null, itemId, function(err, item){
		var	keyword = [req.body.keyword_1,req.body.keyword_2,req.body.keyword_3,req.body.keyword_4];
		var editItem = new Item({
			itemName: item.itemName,
			itemId: item.itemId,
			keyword: keyword,
			category: req.body.category,
			description: req.body.description,
			userName: item.userName,
			userId: item.userId,
			listNameList: item.listNameList,
			listIdList: item.listIdList,
			rate: item.rate
		});
		editItem.update(item.itemName, keyword, req.body.category, req.body.description, null, null, null, function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','Successfully Edit!');
			res.redirect('/');
	});
  });
  });

//==========================remove an item=======================================
app.get('/remove-item/:itemId', adminLogin);
app.get('/remove-item/:itemId', function (req, res) {
	var itemId = new ObjectId(req.params.itemId);
	
	Item.get(null, itemId, function(err, item){
	if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
	Item.remove(itemId, function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
	List.removeItemInfo(req.params.itemId, item.itemName, function(err){
	if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
    req.flash('success', 'Remove successfully!');
    res.redirect('/');
    });
	});
  });
});

//==========================edit an user=======================================

app.post('/edit-user', adminLogin);
app.post('/edit-user', function (req, res) {
	var userType = req.body.userType;
	var name = req.body.name;
	var email = req.body.email;
	var userId = new ObjectId(req.body.userId);

//in the database
	var editedUser = new User({
		name: name,
		userId: userId,
		password: "null",
		email: email,
		userType: userType
	});
	editedUser.update(name,userId,null,email,userType,function(err,user){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		req.flash('success','user edited successfully');
		res.redirect('/user-management');
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
	var userId = user.userId;
	newPermissionUser.update(null,userId,null,null,userType,function(err,user){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		req.flash('success','Permission given successfully');
		res.redirect('/user-management');
		});
  });
  });
//==========================remove an user=======================================
app.get('/remove-user/:userName/:userId', adminLogin);
app.get('/remove-user/:userName/:userId', function (req, res) {
	  var userId = new ObjectId(req.params.userId);
	User.remove(userId, function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
    req.flash('success', 'Remove user: ' + req.params.userName + ' successfully!');
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
	var itemIdList = [];
	var itemNameList = [];
//new list
		newList = new List({
			listName: req.body.listName,
			listId: listId,
			userName: req.session.user.name,
			userId: req.session.user.userId,
			info: req.body.info,
			rate: 0,
			itemIdList: itemIdList,
			itemNameList: itemNameList
		});

//check if the list exists
	List.get(newList.listName, null, function(err, list){
		if(list){
			req.flash('error','list already exists');
			if(req.body.webpage == 1){
				res.send({"status": 1});
			}else{
				return res.redirect('/add-list');
			}
		}
//if not in the database
		if(!list){
			newList.save(function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('/add-list');
				}
				req.flash('success','Successfully created a new list');
				if(req.body.webpage == 1){
					res.send({"status": 2});
				}else{
					res.redirect('/add-list');
				}
		});
		}
  });
});

//==========================lists made by a specific admin=======================================
  app.get('/user/:userName', isLogin);
  app.get('/user/:userName', function (req, res) {
	req.session.titleName = req.params.userName,
	req.flash('success','Successfully loaded items and lists made by ' + req.params.userName),
	userName = req.params.userName,
	req.session.listType = "none",
	req.session.listId = null;
	fields = {"userName": req.params.userName};
	listName = null;
	res.redirect('/');
  });

//==========================search items AJAX=======================================
  app.post('/search-items', function (req, res) {
	var search_rule = req.body.search_rule,
		search_word = req.body.search_word;
	fields = {};
	listName = null;
	userName = null;
	
	var regExp = new RegExp(search_word, 'gi');
	if(search_rule == "All items"){
		var temp_array = [{"itemName": regExp},
						{"category": regExp},
						{"keyword": regExp},
						{"description": regExp},
						{"userName": regExp}
						];
		fields = {"$or": temp_array};
		userName = regExp;
	}else if(search_rule == "Item title"){
		fields.itemName = regExp;
	}else if(search_rule == "Category"){
		fields.category = regExp;
	}else if(search_rule == "Keyword"){
		fields.keyword = regExp;
	}else if(search_rule == "User name"){
		fields.userName = regExp;
		userName = regExp;
	}else if(search_rule == "Item description"){
		fields.description = regExp;
	}else if(search_rule == "List title"){
		listName = regExp;
		fields.listNameList = regExp;
	}
	req.session.titleName = "Search for " + search_rule + " contains \"" + search_word +"\"";
	req.session.listType = "none";
	req.session.listId = null;
	res.send({"status": 1});
});


//==========================system generate-list AJAX (new version)=======================================
  app.post('/generate-list-by-rule', function (req, res) {
	var selected_rules = req.body.selected_rules,
		selected_nums = req.body.selected_nums,
		titleName = "New List",
		num_of_items = 0;
		tempList = [],
		and_array = [],
		removed_array = [];
		newItemList = [];

	var pre_rules = ["Random","Top Rated","Last updated","Last Added"],
		new_list_length = 0,
		index_rules;
	
	if (fields.userName===undefined){
		fields.userName=null;
	}
	if (fields.listId===undefined){
		fields.listId=null;
	}
		
	Item.getAll(fields.userName, fields.listId, function(err, items){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		for(var i = 0; i < selected_nums.length; i++){
			new_list_length = new_list_length + parseInt(selected_nums[i]);
		}
		if(new_list_length <= items.length){
			for(var j = 0; j < selected_nums.length; j++){
				selected_conditions = selected_rules[j];
				tempList = items;
				num_of_items = selected_nums[j]*selected_conditions.length;
				for(var k = 0; k < selected_conditions.length; k++){
					index_rules = pre_rules.indexOf(selected_conditions[k]);
						
						if(index_rules == 0){
							for (var i = 0; i < num_of_items; i++) {
								var index = Math.floor(Math.random() * tempList.length);
								var item = tempList[index];
								and_array.push(item);
								tempList.splice(index, 1);
								if(removed_array.indexOf(item) == -1){
									removed_array.push(item);
								}
							}
						}
						if(index_rules == 1){
							tempList.sort(compareBy("rate"));
							tempList.reverse();
							
							for (var i = 0; i < num_of_items; i++) {
								var item = tempList[0];
								and_array.push(item);
								tempList.splice(0, 1);
							if(removed_array.indexOf(item) == -1){
									removed_array.push(item);
								}
							}
						}
						if(index_rules == 2){
							tempList = items;
							tempList.sort(compareDate("lastUpdatedTime"));
							tempList.reverse();
							for (var i = 0; i < num_of_items; i++) {
								var item = tempList[0];
								and_array.push(item);
								tempList.splice(0, 1);
								if(removed_array.indexOf(item) == -1){
									removed_array.push(item);
								}
							}
						}
						if(index_rules == 3){
							tempList = items;
							tempList.sort(compareDate("addedTime"));
							tempList.reverse();
							for (var i = 0; i < num_of_items; i++) {
								var item = tempList[0];
								and_array.push(item);
								tempList.splice(0, 1);
								if(removed_array.indexOf(item) == -1){
									removed_array.push(item);
								}
							}
						}
						num_of_items = num_of_items - selected_nums[j];
						tempList = and_array;
						and_array = [];
				}
				newItemList = newItemList.concat(tempList);
				items = items.concat(removed_array);
			}
			req.session.items = newItemList;
			req.session.titleName = titleName;
			req.session.listType = "auto";
			fields = {};
			listName = null;
			userName = null;
			req.session.listId = null;
			req.flash('success','Successfully generated!');
			res.send({"status": 1});
		}else{
			res.send({"status": 0});
		}
	});
  });
  
  
//==========================save list AJAX=======================================
  app.post('/save-list', function (req, res) {
//produce listId
	var listId = new ObjectId();
	var itemIdList = [];
	var itemNameList = [];
	var items = req.session.items;
	
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		itemIdList.push(item.itemId);
		itemNameList.push(item.itemName);
	}
//new list
		newList = new List({
			listName: req.body.listName,
			listId: listId,
			userName: req.session.user.name,
			userId: req.session.user.userId,
			info: req.body.info,
			rate: 0,
			itemIdList: itemIdList,
			itemNameList: itemNameList
		});

//check if the list exists
	List.get(newList.listName, null, function(err, list){
		if(list){
			req.flash('error','list already exists');
			res.send({"status": 1});
		}
//if not in the database
		if(!list){
			newList.save(function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('/');
				}
				var newItem = new Item({
					itemName: null,
					itemId: null,
					keyword: null,
					category: null,
					description: null,
					userName: null,
					userId: null,
					listNameList: null,
					listIdList: null,
					rate: null
				});
				newItem.multi_update(items, listId, newList.listName, function(err){
					req.flash('success','Successfully saved');
					req.session.listType = "none";
					userName = null;
					req.session.listId = listId;
					req.session.titleName = newList.listName;
					fields = {"listIdList": listId};
					listName = null;
					res.send({"status": 2});
				});
			});
		}
  });
});

 //==========================remove an list=======================================
app.get('/remove-list/:listId', adminLogin);
app.get('/remove-list/:listId', function (req, res) {
	var listId = new ObjectId(req.params.listId);
	List.get(null, listId, function(err, list){
	if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
	List.remove(listId, function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
	
	Item.removeListInfo(listId, list.listName, function(err){
	if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
	userName = null;
    req.flash('success', 'Remove successfully!');
	if(listId == req.session.listId){
		res.redirect('/all-items');
	}else{
		res.redirect('/');
	}
	});
	});
  });
});

//==========================add item rate AJAX=======================================
app.post('/add-item-rate', function(req, res){
	var userId = req.session.user.userId,
		rating = req.body.rating,
		itemId = new ObjectId(req.body.itemId),
		length = 1,
		rate = 0;
	
	var newRate = new Rate({
		itemId: itemId,
		listId: null,
		userId: userId,
		rating: rating
	});
//store value of rating to database
	newRate.update(req.body.itemId, null, userId, rating, function(err){
		if(err){
			req.flash('error',err);
		}
//get average value of a selected item and update to database.
	Rate.getAllRate(req.body.itemId, null, function(err, rates){
	if(err){
		req.flash('error', err);
		rates = [];
	}
	length = rates.length;
	
	Item.get(null, itemId, function(err, item){
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
			rate = (rate * (length - 1) + parseFloat(rating))/length;
			var ratedItem = new Item({
				itemName: item.itemName,
				itemId: item.itemId,
				keyword: item.keyword,
				category: item.category,
				description: item.description,
				userName: item.userName,
				userId: item.userId,
				listNameList: item.listNameList,
				listIdList: item.listIdList,
				rate: rate
			});
			ratedItem.update(item.itemName, null, null, null, null, null, rate, function(err){
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
});

//==========================add list rate AJAX=======================================
app.post('/add-list-rate', function(req, res){
	var userId = req.session.user.userId,
		rating = req.body.rating,
		listId = req.body.listId,
		length = 1,
		rate = 0;
	
	var newRate = new Rate({
		itemId: null,
		listId: listId,
		userId: userId,
		rating: rating
	});
//store value of rating to database
	newRate.update(null, listId, userId, rating, function(err){
		if(err){
			req.flash('error',err);
		}
//get average value of a selected list and update to database.
	Rate.getAllRate(null, listId, function(err, rates){
	if(err){
		req.flash('error', err);
		rates = [];
	}
	length = rates.length;
	list_id = new ObjectId(listId);
	List.get(null, list_id, function(err, list){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		if(!list){
			req.flash('error','List not exist');
			return res.redirect('/');
		}
		if(length != 0){
			rate = list.rate;
			rate = (rate * (length - 1) + parseFloat(rating))/length;
			var ratedList = new List({
				listName: list.listName,
				listId: list.listId,
				userName: list.userName,
				userId: list.userId,
				itemNameList: list.itemNameList,
				itemIdList: list.itemIdList,
				rate: rate,
				info: list.info
			});
			ratedList.update(list.listName, null, null, null, rate, function(err){
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
});

//==========================add to list AJAX=======================================
app.post('/add-to-list', function(req, res){
	var listName = req.body.listName,
		listId = new ObjectId(req.body.listId),
		userName = req.session.user.userName,
		userId = req.session.user.userId,
		itemIdList = req.body.itemIdList,
		itemNameList = req.body.itemNameList,
		rate = req.body.rate,
		itemId = req.body.itemId,
		itemName = req.body.itemName,
		info = req.body.info;
	
	var newAddedList = new List({
      listName: listName,
      listId: listId,
	  userName: userName,
	  userId: userId,
      itemIdList: itemIdList,
	  itemNameList: itemNameList,
	  rate: rate,
	  info: info,
	});
//store an itemId to a selected list
	newAddedList.addToList(itemId, itemName, function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		itemId = new ObjectId(itemId);
		Item.get(null, itemId, function(err, item){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
			var listNameList = item.listNameList,
				listIdList = item.listIdList;
			listIdList.push(listId);
			listNameList.push(listName);
			var newAddedItem = new Item({
				itemName: item.itemName,
				itemId: item.itemId,
				keyword: item.keyword,
				category: item.category,
				description: item.description,
				userName: item.userName,
				userId: item.userId,
				listIdList: listIdList,
				listNameList: listNameList,
				rate: item.rate
			});
				newAddedItem.update(item.itemName, null, null, null, listIdList, listNameList, null, function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('back');
				}
		req.flash('success','added successfully');
		res.redirect('/');
		});
		});
	});
});

//==========================edit list AJAX=======================================
  app.post('/edit-list', function (req, res) {
	var listName = req.body.listName;
	var info = req.body.info;

	var editedList = new List({
		listName: listName,
		listId: "null",
		userName: "null",
		userId: "null",
		itemIdList: "null",
		itemNameList: "null",
		rate: "null",
		info: info,
	});
	editedList.update(listName, info, null, null, null, function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		req.flash('success','Successfully Edit!');
		res.send({"status": 1});
	});
  });

//==========================view list=======================================
app.get('/view-list/:listId', isLogin);
app.get('/view-list/:listId', function(req, res){
	var listId = req.params.listId;
	
//get the selected list' listName
	var list_id = new ObjectId(listId);
	List.get(null, list_id, function(err, list){
		req.session.listId = list_id;
		req.session.titleName = list.listName;
		userName = null;
		req.session.listType = "none";
		fields = {"listIdList": list_id};
		listName = null;
		req.flash('success','selected list loading successfully');
		res.redirect('/');
	});
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

//==========================helper function=======================================
  function compareBy(key){
   return function(a,b){
      if( a[key] > b[key]){
          return 1;
      }else if( a[key] < b[key] ){
          return -1;
      }
      return 0;
   }
}

	function compareDate(date){
		return function(a,b){
			return new Date(b[date]["date"]) - new Date(a[date]["date"]);
		}
	}
};

