var express = require('express');
var router = express.Router();

// 引入connection
const connection = require('./conn');
// 调用连接方法
connection.connect(() => {
  console.log('数据连接成功')
});

// 检查用户名和密码是否正确
router.post('/userLogin', (req, res) => {
  let { username, password } = req.body;
  // 构造sql语句
  const sqlStr = `select * from user where username='${username}' and password='${password}'`;
  // 执行sql语句
  // 执行sql语句（查询用户名和密码是否存在）
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 如果存在 返回成功的数据对象
      if (data.length) {
        // 登录成功 设置cookie (在res.send()之前设置)
        res.cookie('username', data[0].username);
        res.cookie('password', data[0].password);
        res.cookie('groups', data[0].groups);

        res.send({"errcode":1, "msg":"恭喜你，登录成功！"})
      } else {
        // 否则 返回失败的数据对象
        res.send({"errcode":0, "msg":"请检查用户名或密码！"})
      }
    }
  })
});

// 检验用户是否已经登录
router.get('/userLogin',(req,res) => {
  let username = req.cookies.username;
  if(username){
    res.send("")
  }else{
    res.send('alert("请登录！！！");location.href="./login.html";')
  }
});

/* 退出登录 */
router.get('/logout', (req, res) => {
  // 清除cookie
  res.clearCookie('username');
  res.clearCookie('password');
  res.clearCookie('groups');

  // 弹出对应提示 跳转到登录页面
  res.send('<script>alert("退出成功！"); location.href="http://localhost:888/login.html";</script>')

})

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
});
// 管理列表中的删除数据
// 接收前端发来的请求，删除一条用户数据
router.get('/userDelete', (req, res) => {
  // 接收前端发来的id
  let { id } = req.query;
  // 构造通过id删除数据的sql语句
  const sqlStr = `delete from user where id = ${id}`;
  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.send({ "errcode": 1, "msg": "删除成功！" })
      } else {
        res.send({ "errcode": 0, "msg": "删除失败！" })
      }
    }
  })
});

// 管理列表中的修改数据
// 接收前端发来的请求，修改一条用户数据
router.get('/userEdit', (req, res) => {
  // 接收前端发送的数据，并结构
  let { id } = req.query;
  // 构造sql语句，通过id查询数据
  const sqlStr = `select * from user where id=${id}`;
  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err
    } else {
      res.send(data)
    }
  })
});

// 修改页面中修改后的数据
// 接收前端发来请求，保存数据
router.get('/userSave', (req, res) => {
  // 接收前端发来的参数
  let { username, password, groups, id } = req.query;
  // 构造sql语句
  const sqlStr = `update user set username = '${username}',password='${password}',groups='${groups}' where id='${id}'`;
  // 执行修改的sql语句
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err;
    } else {
      if (data.affectedRows > 0) {
        res.send({ "errcode": 1, "msg": "修改成功!" })
      } else {
        res.send({ "errcode": 0, "msg": "修改失败!" })
      }
    }
  })
});

// 用户列表中的批量删除功能
// 接收前端发来的数据，批量删除数据
router.post('/selectDel', (req, res) => {
  let idArr = req.body['idArr[]'];
  // 构造sql语句
  const sqlStr = `delete from user where id in(${idArr})`
  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.send({ "errcode": 1, "msg": "批量删除成功!" })
      } else {
        res.send({ "errcode": 0, "msg": "批量删除失败!" })
      }
    }
  })
});


module.exports = router;
