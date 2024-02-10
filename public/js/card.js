let cart = {};

document.querySelectorAll('.add-to-cart').forEach(function(element){  
  element.onclick = addToCart;
});

//проверка наличия товара в корзине
if (localStorage.getItem('cart')){
  cart = JSON.parse(localStorage.getItem('cart'));
  ajaxGetGoodsInfo();
}

function addToCart(){
  let goodsId = this.dataset.goods_id;
  if (cart[goodsId]) {
    cart[goodsId]++;
  }
  else {
    cart[goodsId] = 1;
  }  
  //console.log(cart);
  ajaxGetGoodsInfo();//получение всей инфо о товаре
}

//данная функция отправляет POST-запрос на сервер, ожидает ответ в формате JSON и преобразует его текст и возвращает
function ajaxGetGoodsInfo(){
  updateLocalStorageCart();
  fetch('/get-goods-info',{
    method: 'POST',
    body: JSON.stringify({key: Object.keys(cart)}),
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }
  })
  .then(function(response){
    return response.text();
  })
  .then(function(body){
    //console.log(body);
    showCart(JSON.parse(body));
  })
}

function showCart(data) {
  let out = '<table class="table table-striped table-cart"><tbody>';//открытие таблицы
  let total = 0;// сумма товаров в корзине
  for (let key in cart){//перебор массива cart
    out +=`<tr><td colspan="4"><a href="/goods?id=${key}">${data[key]['name']}</a></tr>`;//название товара
    out += `<tr><td><i class="far fa-minus-square cart-minus" data-goods_id="${key}"></i></td>`;//минус
    out += `<td>${cart[key]}</td>`;//количество товара
    out += `<td><i class="far fa-plus-square cart-plus" data-goods_id="${key}"></i></td>`;//плюс
    out += `<td>${formatPrice(data[key]['cost'] * cart[key])} руб </td>`//стоимость
    out += '</tr>';
    total += cart[key]*data[key]['cost'];//общая стоимость
  }
  out += `<tr><td colspan="3">Итого: </td><td>${formatPrice(total)} руб</td></tr>`;//вывод Итого:
  out += '</tbody></table>';//закрытие таблицы
  document.querySelector('#cart-nav').innerHTML = out;//вывод содержимое out в div(id='cart-nav') в файле nav.pug
  document.querySelectorAll('.cart-minus').forEach(function(element){
    element.onclick = cartMinus;
  });
  document.querySelectorAll('.cart-plus').forEach(function(element){
    element.onclick = cartPlus;
  });
}

function cartPlus() {
  let goodsId = this.dataset.goods_id;
  cart[goodsId]++;
  ajaxGetGoodsInfo();
}

function cartMinus() {
  let goodsId = this.dataset.goods_id;
  if (cart[goodsId] -1 > 0){
    cart[goodsId]--;
  }
  else {
    delete(cart[goodsId]);
  }
  ajaxGetGoodsInfo();
}

//сохранение состояние корзины
function updateLocalStorageCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(price) {
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
}