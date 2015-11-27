/*
 * API page, list all routes
 */
var parse = require('co-body');
var busparse = require('co-busboy');
var route = require('koa-route');

var render = require('../config/render');
var config = require('../config/config')();
var monk = require('monk');
var db = monk(config.mongoUrl);

var fs = require('fs');
var os = require('os');
var path = require('path');

var wrap = require('co-monk');
var Achieve = wrap(db.get('achieves'));
var Achieve_User=wrap(db.get('achieve_users'));

/**
成就 crud
**/
module.exports = function(app, route) {
  /* Find all achieves */
  app.use(route.get('/api/achieve',function*(){
    if('GET' != this.method) return yield next;
    this.body = yield Achieve.find({});
  }));

  /*  */
  app.use(route.get('/api/achieve/:id',function*(id){
    if('GET' != this.method) return yield next;
    var one = yield Achieve.findById(id);
    if (!one) {
        this.throw(404, "Achieve not found.");
    }
    this.body=one;
  }));

  /*
  新增成就
  运营权限
  */
  app.use(route.post('/api/achieve',function*(){
    if('POST' != this.method) return yield next;
    var input = yield parse(this);
    var inserted = yield Achieve.insert({
        title:input.title,
        desc:input.desc,
        icon:input.icon,
        score:input.score,
    });
    if(!inserted) {
      this.throw(405, "Unable to add new book.");
    }
    this.body=inserted;
  }));

  /**
   * Handle updateing book
   * @type {String}
   */
  app.use(route.put('/api/achieve/:id', function *(id) {
    if('PUT' != this.method) return yield next;
    var input = yield parse(this);
  	var updated = yield Achieve.updateById(id, {
          title: input.title,
          desc: input.desc,
          icon:input.icon,
          score:input.score
    });
    console.log(updated);
    if(!updated) {
        this.throw(405, "Unable to update achieve %s", input.title);
    }
    this.body = input;
  }));

  app.use(route.delete('/api/achieve/:id', function *(id) {
    if('DELETE' != this.method) return yield next;
    var removed = yield Achieve.remove({"_id": id});
    if(!removed) {
      this.throw(405, "Unable to delete book");
    }
    this.throw(200, "Delete book %s", id);
  }));

  app.use(route.get('/achieve/:id',function*(id){
    if('GET' != this.method) return yield next;
    var achieve = yield Achieve.findById(id);
    this.body = yield render('achieve/index.html', {'achieve':achieve});
  }));

  app.use(route.post('/achieve/:id/apply',function*(id){
    if('POST' != this.method) return yield next;
    if (!this.session.user) {
      this.throw(404,"Please login.");
    }
    var input = busparse(this);
    var part;
    var extra = {
      'images':[]
    }
    while(part = yield input){
      __dirname + '/../views'
      var filename = new Date().getTime()+'';
      console.log(filename);
      var stream = fs.createWriteStream(path.join(__dirname+'/../public/upload',filename));
      part.pipe(stream);
      console.log('uploading %s -> %s', part.filename, stream.path);
      extra.images.push('/upload/'+filename);
      // console.log(part);
      // console.log(typeof stream.path);
    }
    //temp
    console.log(extra);


    if (!id) {
      this.throw(404,"Achieve_id is empty.");
    }
    var inserted = yield Achieve_User.insert({
        user_id:this.session.user._id,
        achieve_id:id,
        status:1, //申请中
        create_time:new Date(),
        update_tiem:new Date(),
        extra:extra
    });
    if(!inserted) {
      this.throw(405, "Unable to add new achieve apply.");
    }
    // this.body=inserted;
    this.redirect('/user/profile');

  }));








}
