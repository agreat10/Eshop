const express = require('express');
const app = express();

// Устанавливаем Pug в качестве шаблонизатора
app.set('view engine', 'pug');
app.set('views', './views'); // Указываем директорию для шаблонов Pug

// Маршруты
app.get('/', (req, res) => {
  res.render('main', { title: 'Привет, мир!', message: 'Это пример использования Pug с Express!', foo: '777' });
});

// Запускаем сервер
const port = 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
