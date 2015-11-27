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
var Achieve_User = wrap(db.get('achieve_users'));
/**
**/
module.exports = function(app, route) {
    /**
    查看成就
    **/
    app.use(route.get('/api/achieve_user',function*(){
      if('GET' != this.method) return yield next;
      console.log(this.session.user);
      this.body=yield Achieve_User.find({});
    }));

    /**
    申请成就
    **/
    app.use(route.post('/api/achieve_user',function*(){
      if('POST' != this.method) return yield next;

      if (!this.session.user) {
        this.throw(404,"Please login.");
      }
      var input = yield parse(this);

      //temp
      var extra = {
        'images':[
          'http:1',
          'http:1'
        ]
      }

      if (!input.achieve_id) {
        this.throw(404,"Achieve_id is empty.");
      }
      var inserted = yield Achieve_User.insert({
          user_id:this.session.user._id,
          achieve_id:input.achieve_id,
          status:1, //申请中
          create_time:new Date(),
          update_tiem:new Date(),
          extra:extra
      });
      if(!inserted) {
        this.throw(405, "Unable to add new achieve apply.");
      }
      this.body=inserted;
    }));
    /**
    审核成就
    id
    status: 0:未完成 1：审核中 2：完成
    **/
    app.use(route.post('/api/achieve_user/:id/update',function*(id){
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
          update_tiem:new Date()
      });

      if(!update) {
        this.throw(405, "Unable to update achieve_user.");
      }
      var find = yield Achieve_User.findById(id);
      this.body=find;
    }));

}
