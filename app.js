const express = require('express');
const app = express();

// Устанавливаем Pug в качестве шаблонизатора
app.set('view engine', 'pug');
app.set('views', './views'); // Указываем директорию для шаблонов Pug
app.use(express.static('public'));

//подключаем MySQL
let mysql = require('mysql');

app.use(express.json());
//настраиваем 
let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'market'
});

// Запускаем сервер 1lWM3QA)zevmY4/b
const port = 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

// Маршруты
app.get('/', (req, res) => {
  con.query(
    'SELECT * FROM goods',
    function(error,result){
      if(error) throw error;
      //console.log(result);
      let goods = {};
      for(let i = 0; i < result.length; i++)
      {
        goods[result[i]['id']] = result[i];
        //console.log(i);
      }
      //console.log(JSON.parse(JSON.stringify(goods)));
      res.render('main', {
         title: 'Привет, мир!',
          message: 'Это пример использования Pug с Express!', foo: '7775',
          qq: 333,
          goods: JSON.parse(JSON.stringify(goods))
         });
    }
  );  
});
app.get('/cat', function(req, res){
  
  //res.render('cat', {});
     
  //console.log(req.query.id);
  let catId = req.query.id;

   let cat = new Promise(function(resolve,reject){
    con.query(
      'SELECT * FROM category WHERE id='+catId,
      function(error, result){
        if(error) reject(error);
        resolve(result);
      });
  });

  let goods = new Promise(function(resolve,reject){
    con.query(
      'SELECT * FROM goods WHERE category='+catId,
      function(error, result){
        if(error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, goods]).then(function(value){
    //console.log(value[1]);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1]))
    });
  }) /**/

});
app.get('/goods', function (req, res) {
  //console.log(req.query.id);
  con.query('SELECT * FROM goods WHERE id=' + req.query.id, function (error, result, fields) {
    if (error) throw error;
    res.render('goods', { goods: JSON.parse(JSON.stringify(result)) });
  });
});

app.post('/get-category-list', function (req, res) {
  // console.log(req.body);
  con.query('SELECT id, category FROM category', function (error, result, fields) {
    if (error) throw error;
    ///console.log(result)
    res.json(result);
  });
});

app.post('/get-goods-info', function (req, res) {
  console.log(req.body.key);
  if (req.body.key.length !=0){
    con.query('SELECT id,name,cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function (error, result, fields) {
      if (error) throw error;
      console.log(result);
      let goods = {};
      for (let i = 0; i < result.length; i++){
        goods[result[i]['id']] = result[i];
      }
      res.json(goods);
    });
  }
  else{
    res.send('0');
  }
});