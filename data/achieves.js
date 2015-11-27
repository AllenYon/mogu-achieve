"use strict";

var config = require('../config/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var usersData = require('./users.json');
var achievesData = require('./achieves.json');
var achieveCategorysData = require('./achieve_categorys.json');

// module.exports.countDb= function() {
// 	var Book = wrap(db.get('books'));
// 	return Book.count();
// }
// module.exports.resetDB = function() {
// 	var Book = wrap(db.get('books'));
// 	Book.remove();
// }

module.exports.initDb = function () {
	var User = wrap(db.get('users'));
	User.insert(usersData);
	var Achieve = wrap(db.get('achieves'));
	Achieve.insert(achievesData);
	var Achieve_Category = wrap(db.get('achieve_categorys'));
	Achieve_Category.insert(achieveCategorysData);
}
