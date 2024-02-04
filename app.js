const express = require('express');
const app = express();

// Устанавливаем Pug в качестве шаблонизатора
app.set('view engine', 'pug');
app.set('views', './views'); // Указываем директорию для шаблонов Pug
app.use(express.static('public'));




//подключаем MySQL
let mysql = require('mysql');
//настраиваем 
let con = mysql.createConnection({
  host: 'localhost',
  user: 'agreat',
  password: 'agreat',
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
        console.log(i);
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
