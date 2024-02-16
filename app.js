let express = require('express');
let app = express();
let cookieParser = require('cookie-parser');
let admin = require('./admin');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Папка для сохранения загруженных файлов
/**
 * public - имя папки где хранится статика
 */
app.use(express.static('public'));
/**
 *  задаем шаблонизатор
 */
app.set('view engine', 'pug');
/**
* Подключаем mysql модуль
*/
let mysql = require('mysql');
/**
* настраиваем модуль
*/
app.use(express.json());

app.use(express.urlencoded());
app.use(cookieParser());

const nodemailer = require('nodemailer');

let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'market'
});










process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.listen(3000, function () {
  console.log('node express work on 3000');
});

app.use(function (req, res, next) {
  if (req.originalUrl == '/admin' || req.originalUrl == '/admin-order') {
    admin(req, res, con, next);
  }
  else {
    next();
  }
});

app.get('/', function (req, res) {
  let cat1 = new Promise(function (resolve, reject) {
    con.query(
      "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  let catDescription = new Promise(function (resolve, reject) {
    con.query(
      "SELECT * FROM category",
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  Promise.all([cat1, catDescription]).then(function (value) {
    //console.log(value[0]);
    res.render('index', {
      goods: JSON.parse(JSON.stringify(value[0])),
      cat2: JSON.parse(JSON.stringify(value[1])),
    });
  });
});

app.get('/cat', function (req, res) {
  console.log(req.query.id);
  let catId = req.query.id;

  let cat = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM category WHERE id=' + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });
  let goods = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM goods WHERE category=' + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, goods]).then(function (value) {
    console.log(value[0]);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1]))
    });
  })
});

app.get('/goods', function (req, res) {
  console.log(req.query.id);
  con.query('SELECT * FROM goods WHERE id=' + req.query.id, function (error, result, fields) {
    if (error) throw error;
    res.render('goods', { goods: JSON.parse(JSON.stringify(result)) });
  });
});

app.get('/order', function (req, res) {
  res.render('order');
});


app.post('/get-category-list', function (req, res) {
  // console.log(req.body);
  con.query('SELECT id, category FROM category', function (error, result, fields) {
    if (error) throw error;
    //console.log(result)
    res.json(result);
  });
});

app.post('/get-goods-info', function (req, res) {
  //console.log(req.body.key);
  if (req.body.key.length != 0) {
    con.query('SELECT id,name,cost FROM goods WHERE id IN (' + req.body.key.join(',') + ')', function (error, result, fields) {
      if (error) throw error;
      //console.log(result);
      let goods = {};
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i];
      }
      res.json(goods);
    });
  }
  else {
    res.send('0');
  }
});

app.post('/finish-order', function (req, res) {
  //console.log(req.body);
  if (req.body.key.length != 0) {
    let key = Object.keys(req.body.key);
    con.query(
      'SELECT id,name,cost FROM goods WHERE id IN (' + key.join(',') + ')',
      function (error, result, fields) {
        if (error) throw error;
        //console.log(result);
        sendMail(req.body, result).catch(console.error);
        saveOrder(req.body, result);
        res.send('1');
      });
  }
  else {
    res.send('0');
  }
});

app.get('/admin', function (req, res) {
  //console.log(req.cookies.hash);
  res.render('admin', {});
});



app.get('/admin-order', function (req, res) {
  con.query(`SELECT 
	shop_order.id as id,
	shop_order.user_id as user_id,
    shop_order.goods_id as goods_id,
    shop_order.goods_cost as goods_cost,
    shop_order.goods_amount as goods_amount,
    shop_order.total as total,
    from_unixtime(date,"%Y-%m-%d %h:%m") as human_date,
    user_info.user_name as user,
    user_info.user_phone as phone,
    user_info.address as address
FROM 
	shop_order
LEFT JOIN	
	user_info
ON shop_order.user_id = user_info.id ORDER BY id DESC`, function (error, result, fields) {
      if (error) throw error;
      console.log(result);
      res.render('admin-order', { order: JSON.parse(JSON.stringify(result)) });
    });
});


app.get('/admin-goods', function(req, res) {
  con.query('SELECT * FROM category', function(err, rows) {
    if (err) throw err;
    res.render('admin-goods', { categories: rows });
  });
});

// Обработчик POST запроса для изменения категории
app.post('/admin-goods/:id/edit', (req, res) => {
    const categoryId = req.params.id;
    const newCategory = req.body.newCategory;

  console.log('Категория');
  console.log(categoryId);
  console.log(newCategory);
  con.query('UPDATE category SET category = ? WHERE id = ?', [newCategory, categoryId], function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send("Произошла ошибка при обновлении категории.");
    } else {
      res.redirect('/admin-goods');
     
    }
  });
});


app.post('/admin-goods/:id/delete', function(req, res) {
  var categoryId = req.params.id;
  con.query('DELETE FROM category WHERE id = ?', [categoryId], function(err) {
    if (err) throw err;
    res.redirect('/admin-goods');
  });
});

app.post('/admin-goods', function(req, res) {
  var categoryName = req.body.category;
  con.query('INSERT INTO category (category) VALUES (?)', [categoryName], function(err) {
    if (err) throw err;
    res.redirect('/admin-goods');
  });
});


app.get('/admin-product', function(req, res) {
  con.query('SELECT goods.*, category.category FROM goods JOIN category ON goods.category = category.id', function(err, rows) {
    if (err) throw err;
    res.render('admin-product', { products: rows });
  });
});

app.post('/admin-product/:id/delete', function(req, res) {
  var productId = req.params.id;
  con.query('DELETE FROM goods WHERE id = ?', [productId], function(err) {
    if (err) throw err;
    res.redirect('/admin-product');
  });
});

/* app.post('/admin-product', function(req, res) {

  var productName = req.body.name;
  var productDescription = req.body.description;
  var productCost = req.body.cost;
  var productImage = req.body.image;
  var productCategory = req.body.category;
  console.log('Имя');
  console.log(productName);
  console.log(productCategory);

  con.query('INSERT INTO goods (name, description, cost, image, category) VALUES (?,?,?,?,?)', [productName, productDescription, productCost, productImage, productCategory], function(err, result) {
    if (err) {
      console.error('Ошибка при добавлении товара:', err);
      res.status(500).send('Ошибка при добавлении товара');
    } else {
      console.log('Товар успешно добавлен');
      res.redirect('/admin-product');
    }
  });
}); */

app.post('/admin-product', upload.single('image'), function(req, res) {
  var productName = req.body.name;
  var productDescription = req.body.description;
  var productPrice = req.body.price;
  var productCategory = req.body.category;
  var productImage = req.file.filename; // Имя загруженного файла
  var originalImageName = req.file.originalname; // Изначальное имя файла изображения
  con.query('INSERT INTO goods (name, description, cost, category, image) VALUES (?,?,?,?,?)', [productName, productDescription, productPrice, productCategory, originalImageName], function(err, result) {
    if (err) {
      console.error('Ошибка при добавлении товара:', err);
      res.status(500).send('Ошибка при добавлении товара');
    } else {
      console.log('Товар успешно добавлен');
      res.redirect('/admin-product');
    }
  });
});

/**
 *  login form ==============================
 */
app.get('/login', function (req, res) {
  res.render('login', {});
});

app.post('/login', function (req, res) {
  console.log('!=======================');
  console.log(req.body);
  //console.log(req.body.login);
  //console.log(req.body.password);
  console.log('=======================!');
  con.query(
    'SELECT * FROM user WHERE login="' + req.body.login + '" and password="' + req.body.password + '"',
    function (error, result) {
      if (error) reject(error);
      console.log('result');      
      console.log(result);
      console.log('result.length');
      console.log(result.length);
      if (result.length == 0) {
        console.log('error user not found');
        res.redirect('/login');
      }
      else {
        result = JSON.parse(JSON.stringify(result));
        //console.log(result[0]['id']);
        let hash = makeHash(32);
       res.cookie('hash', hash);
       res.cookie('id', result[0]['id']);
       //res.end('BLASSS');
        /* *
         * write hash to db
         */
        sql = "UPDATE user  SET hash='" + hash + "' WHERE id=" + result[0]['id'];//устанавливаем куки
        con.query(sql, function (error, resultQuery) {
          if (error) throw error;
          res.redirect('/admin');
        }); /**/
        //console.log('Получилось');

      };
    });
});


function saveOrder(data, result) {
  // data - информация о пользователе
  // result - сведения о товаре
  let sql;
  sql = "INSERT INTO user_info (user_name, user_phone, user_email, address) VALUES ('" + data.username + "','" + data.phone + "','" + data.email + "','" + data.address + "')";
  con.query(sql, function (error, resultQuery) {
    if (error) throw error;
    console.log('1 user info saved');
    console.log(resultQuery);
    let userId = resultQuery.insertId;
    date = new Date() / 1000;
    for (let i = 0; i < result.length; i++) {
      sql = "INSERT INTO shop_order(date, user_id, goods_id,goods_cost, goods_amount, total) VALUES (" + date + "," + userId + "," + result[i]['id'] + "," + result[i]['cost'] + "," + data.key[result[i]['id']] + "," + data.key[result[i]['id']] * result[i]['cost'] + ")";
      con.query(sql, function (error, resultQuery) {
        if (error) throw error;
        console.log("1 goods saved");
      })
    }
  });

}


async function sendMail(data, result) {
  let res = '<h2>Заказ из магазина</h2>';
  let total = 0;
  for (let i = 0; i < result.length; i++) {
    res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - ${result[i]['cost'] * data.key[result[i]['id']]} руб</p>`;
    total += result[i]['cost'] * data.key[result[i]['id']];
  }
  //console.log(res);
  res += '<hr>';
  res += `Итого: ${total} руб`;
  res += `<hr>Телефон: ${data.phone}`;
  res += `<hr>Имя: ${data.username}`;
  res += `<hr>Адрес: ${data.address}`;
  res += `<hr>Email: ${data.email}`;

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,//465
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  });

  let mailOption = {
    from: '<komolov10@gmail.com>',
    to: "komolov10@gmail.com," + data.email,
    subject: "Lite shop order",
    text: 'Hello world',
    html: res
  };

  //отправка письма
  let info = await transporter.sendMail(mailOption);
  console.log("MessageSent: %s", info.messageId);
  console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));
  return true; /**/
}


function makeHash(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}