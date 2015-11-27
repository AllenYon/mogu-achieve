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
var Book = wrap(db.get('books'));
var User = wrap(db.get('users'));
var Achieve = wrap(db.get('achieves'));
var Achieve_User = wrap(db.get('achieve_users'));

module.exports = function(app, route) {
  /**
  **/
  app.use(route.post('/api/login',function*(){
  	if('POST' != this.method) return yield next;
    var loginUser = yield parse(this);

    // 内网登录
    //var result = yield OAuthLogin.login(loginUser.username,loginUser.password);
    var user = yield User.find({'username':loginUser.username});
    if (!user||user.length<=0) {
      this.throw(404,'User not found');
    }
    this.session.user=user[0];
    this.body = user;
  }));



  /**
  获取个人信息
  **/
  app.use(route.get('/api/getprofile',function*(){
  	if('GET' != this.method) return yield next;
    if (!this.session.user) {
      this.throw(404,'Please login');
    }
    var profile=this.session.user;
    var apply_list = yield Achieve_User.find({
      user_id:profile._id,
      status:1
    });
    var done_list = yield Achieve_User.find({
      user_id:profile._id,
      status:2
    });
    profile['apply_list']=apply_list;
    profile['done_list']=done_list;
    this.body=profile;
  }));

  /**
  查个用户信息
  **/
  app.use(route.get('/api/user/:id',function*(id){
  	if('GET' != this.method) return yield next;
    var user = yield User.findById(id);
    if (user) {
      this.body=user;
    } else {
      this.body={'msg':'4004'}
    }
  }));

  /**
  所有用户信息
  **/
  app.use(route.get('/api/user',function*(){
  	if('GET' != this.method) return yield next;
    this.body = yield User.find({});
  }));


  /////////////////////////////////

  app.use(route.get('/user/login',function*(){
    if('GET' != this.method) return yield next;
    this.body = yield render('user/login.html', null);
  }));

  app.use(route.post('/user/login',function*(){
    if('POST' != this.method) return yield next;
    var loginUser = yield parse(this);

    // 内网登录
    //var result = yield OAuthLogin.login(loginUser.username,loginUser.password);
    var user = yield User.find({'username':loginUser.username});
    if (!user||user.length<=0) {
      this.throw(404,'User not found');
    }
    this.session.user=user[0];

    this.redirect('/user/profile');
  }));


  app.use(route.get('/user/profile',function*(){
    if('GET' != this.method) return yield next;
    if (!this.session.user) {
      this.throw(404,'Please login');
    }
    var profile=this.session.user;
    var apply_list = yield Achieve_User.find({
      user_id:profile._id,
      status:1
    });

    for (var i = 0; i < apply_list.length; i++) {
        // apply_list[i];
        var findAchieve = yield Achieve.findById(apply_list[i].achieve_id);
        apply_list[i]['achieve']=findAchieve;
    };

    var done_list = yield Achieve_User.find({
      user_id:profile._id,
      status:2
    });


    for (var i = 0; i < done_list.length; i++) {
        // apply_list[i];
        var findAchieve = yield Achieve.findById(done_list[i].achieve_id);
        var findUser = yield User.findById(done_list[i].user_id);
        done_list[i]['achieve']=findAchieve;
    };

    // console.log('undone_list '+apply_list);
    profile['apply_list']=apply_list;
    profile['done_list']=done_list;


    var done_achieve_ids=new Array();
    for (var i = 0; i < done_list.length; i++) {
      console.log(' x '+done_list[i].achieve_id);
      done_achieve_ids.push(done_list[i].achieve_id);
    }
    // console.log('done_achieve_ids '+done_achieve_ids);

    var undone_list = yield Achieve.find({});
    // console.log('undone_list '+undone_list);

    // for (var i = 0; i < undone_list.length; i++) {
    for(var i = undone_list.length-1;i>=0;i--){
      console.log(undone_list[i]._id.toString());
      console.log(typeof undone_list[i]._id.toString());
      if (done_achieve_ids.indexOf(undone_list[i]._id.toString())!==-1){
        // undone_list[i]._id.toString() in done_achieve_ids ) {
        console.log(true);
        // undone_list.
        undone_list.splice(i,1);
        // delete undone_list[i];
      }
    }

    // for (var i = 0; i < undone_list.length; i++) {
    //     var findAchieve = yield Achieve.findById(undone_list[i].achieve_id);
    //     undone_list[i]['achieve']=findAchieve;
    // };

    // profile['a']=[{'x':"中文"}];
    profile['undone_list']=undone_list;
    // console.log(undone_list);
    console.log(profile);

    this.body = yield render('user/profile.html', {'profile':profile});

  }));


}
