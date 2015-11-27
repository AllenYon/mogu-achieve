

#User

```
username:String //用户名
department: String //部门
avatar:String //头像
words:String //签名
likes:String
scores:String
admin:int // 0:user 1:admin
```

# Achieve

```
"title":"和CEO合影",
"desc":"快去吧少年~",
"icon":null,
"score":5,
```

# Achieve_Category
```
"category":"数据",
"achieves":[],
"sort":2
```


# Achieve_User

```
_id:String
user_id:String // 申请人
achieve_id:String // 申请成就
status: int // 1:申请中 2: 完成
create_time:time //申请时间
update_time:time //更新时间
"extra":{}
```
