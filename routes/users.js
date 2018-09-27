var express = require('express');
var router = express.Router();

// 引入connection
const connection = require('./conn');
// 调用连接方法
connection.connect(() => {
  console.log('数据连接成功')
});

// 添加账号功能
// 接收前端发送的请求
router.post('/userAdd', (req, res) => {
  // 解构，获取前端发送的数据
  let { username, password, groups } = req.body;
  // 把用户的数据 存入数据库
  const sqlStr = `insert into user(username,password,groups) values(?,?,?)`;
  // 接收到的数据参数
  const sqlPramas = [username, password, groups];
  // 保存数据到数据库
  connection.query(sqlStr, sqlPramas, (err, data) => {
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {  //如果数据的行数改变
        res.send({ "errcode": 1, "msg": "添加成功" })
      } else {
        res.send({ "errcode": 0, "msg": "添加失败" })
      }
    }
  })
});

// 添加用户数据到管理列表
// 接收前端发送的请求,回应数据
router.get('/userList', (req, res) => {
  // 构造sql语句
  const sqlStr = 'select * from user order by ctime desc';
  // 执行sql
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err
    } else {
      res.send(data)
    }
  })
})
// 管理列表中的删除数据
// 接收前端发来的请求，删除一条用户数据
router.get('/userDelete', (req, res) => {
  // 接收前端发来的id
  let { id } = req.query;
  // 构造通过id删除数据的sql语句
  const sqlStr = `delete from user where id = ${id}`;;
  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    if(err){
      throw err
    }else{
      if(data.affectedRows > 0){
        res.send({"errcode":1,"msg":"删除成功！"})
      }else{
        res.send({"errcode":0,"msg":"删除失败！"})
      }
    }
  })
})



module.exports = router;
