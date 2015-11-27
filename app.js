'use strict';

// Requires
var koa = require('koa');
var session = require('koa-session-store');
var mongoStore = require('koa-session-mongo');

var path = require('path');
var fs = require('fs');
var views = require('co-views');
var serve = require('koa-static');
var route = require('koa-route');
var logger = require('koa-logger');
var jsonp = require('koa-jsonp');
var render = require('./config/render');
var config = require('./config/config')();

/******************************************************
 * Initialize application
 ******************************************************/
var app = module.exports = koa();
app.keys = ['zxcvbnm'];
app.use(session({
  // store: mongoStore.create({
  //   db: 'achieve_session'
  // })
}));


app.use(logger());
app.use(jsonp());

/** Define public path, for css/js/images **/
app.use(serve(__dirname + '/public'));
console.log(__dirname);

/******************************************************
 * Bootstrap routes/api
 * Scan all directory /routes and add to app
 ******************************************************/
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
  if(file[0] === '.') return;
  require(routesPath + '/' + file)(app, route);
});


/******************************************************
 * Handle Error 404 and 500
 ******************************************************/
app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

app.use(function *(){
    var err = new Error();
    err.status = 404;
    this.body  = yield render('404.html', { errors: err});
});

/******************************************************
 * Prepopulate database or not
 * Variables
 * (boolean) resetDB
 * (boolean) populateData
 ******************************************************/
var resetDB = false;
var populateData = false;
var resetAchieves = false;
if(resetDB || populateData||resetAchieves) {
  var data = require('./data/sample.data.js');
  var achieves_data = require('./data/achieves.js');

  if(resetDB) {
    console.log('Begin truncating database. %d record(s) will be deleted.', data.countDb());
    data.resetDB();
    console.log('Database is empty now.');
  }
  if(populateData) {
    console.log('Begin importing sample data.');
    data.populateDb();
    console.log('Data imported. %d record(s).', data.countDb());
  }
  if (resetAchieves) {
    console.log('Begin importing sample data.');
    achieves_data.initDb();
    console.log('Data imported. %d record(s).', data.countDb());
  }
}

/******************************************************
 * Start server
 ******************************************************/
if (!module.parent) {
  var port = process.env.PORT || config.port || 9001;
  app.listen(port);
  console.log('Running %s site at: http://localhost:%d', config.mode, port);
}
