/*
 * API page, list all routes
 */
var parse = require('co-body');
var route = require('koa-route');

var render = require('../config/render');
var config = require('../config/config')();
var monk = require('monk');
var db = monk(config.mongoUrl);

var wrap = require('co-monk');
var User = wrap(db.get('users'));
var Achieve = wrap(db.get('achieves'));
var Achieve_User = wrap(db.get('achieve_users'));

module.exports = function(app, route) {
  /**
  管理员登录
  **/
  app.use(route.get('/admin/login',function*(){
    this.body = yield render('admin/login.html', null);
  }));


  app.use(route.post('/admin/login',function*(){
  	if('POST' != this.method) return yield next;
    var loginUser = yield parse(this);
    // 内网登录
    //var result = yield OAuthLogin.login(loginUser.username,loginUser.password);
    var user = yield User.find({'username':loginUser.username});
    //
    if (!user||user.length<=0) {
      this.throw(404,'User not found');
    }

    if (user[0].admin!=1) {
      //不是管理员
      this.throw(404,'You are not admin ');
    }
    this.session.user=user[0];
    // this.body = yield render('admin/index', null);
    this.redirect('/admin/index');
  }));

    app.use(route.get('/admin/index',function*(){
      if('GET' != this.method) return yield next;
      if (!this.session.user) {
        this.throw(404,'Please login');
      }
      if (this.session.user.admin==0) {
        this.throw(404,'You are not admin');
      }

      var achieve_users=yield Achieve_User.find({status:1});
      var achieves=yield Achieve.find({});
      var users=yield User.find({});
      this.body = yield render('admin/index.html', {
        achieve_users:achieve_users,
        achieves:achieves,
        users:users,
      });
    }));


    app.use(route.get('/admin/achieve/add',function*(){
      if('GET' != this.method) return yield next;
      this.body = yield render('admin/achieve-add.html', null);
    }));
    app.use(route.post('/admin/achieve/add',function*(){
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

      //TODO 友好提示成功
      // this.body=inserted;
      // this.body = yield render('admin/achieve-add.html', null);
      this.redirect('/admin/index');
    }));

    app.use(route.get('/admin/achieve/:id/edit', function*(id){
      if('GET' != this.method) return yield next;
      var achieve = yield Achieve.findById(id);
      if(!achieve) {
        this.throw(404, "achieve doesn't exist");
      }
      this.body = yield render('/admin/achieve-edit.html', { "achieve": achieve});
    }));

    app.use(route.post('/admin/achieve_user/:id/update',function*(id){
      if('POST' != this.method) return yield next;
      if (!this.session.user) {
        this.throw(404,"Please login.");
      }
      var input = yield parse(this);
      if (!input.status) {
        this.throw(404,"Status is empty.");
      }
      var find = yield Achieve_User.findById(id);
      var update = yield Achieve_User.updateById(id, {
          user_id:find.user_id,
          achieve_id:find.achieve_id,
          status: parseInt(input.status), //申请中
          create_time:find.create_time,
          update_tiem:new Date(),
          extra:find.extra
      });

      if(!update) {
        this.throw(405, "Unable to update achieve_user.");
      }
      // var find = yield Achieve_User.findById(id);
      // this.body=find;
      this.redirect('/admin/index');
    }));

}
