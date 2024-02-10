document.querySelector('#lite-shop-order').onsubmit = function (event) {
    event.preventDefault();//останавливаем перезагрузку страницы при нажатии ЗАКАЗАТЬ

    //извлечение данных и обрезание пробелов
    let username = document.querySelector('#username').value.trim();
    let phone = document.querySelector('#phone').value.trim();
    let email = document.querySelector('#email').value.trim();
    let address = document.querySelector('#address').value.trim();

    if (!document.querySelector('#rule').checked) {
        //с правилами не согласен
        Swal.fire({
            title: 'Внимание',
            text: 'Необходимо согласиться с условиями',
            type: 'info',
            confirmButtonText: 'Ok'
        });
        return false;
    }

    if (username == '' || phone == '' || email == '' || address == '') {
        //не заполнены поля
        Swal.fire({
            title: 'Внимание',
            text: 'Заполните все поля',
            type: 'info',
            confirmButtonText: 'Ok'
        });
        return false;
    }

    //параметры отправки данных на сервер
    fetch('/finish-order', {
        method: 'POST',
        body: JSON.stringify({
            'username': username,
            'phone': phone,
            'address': address,
            'email': email,
            'key': JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (body) {
            if (body == 1) {
                //если заказ ушел
                Swal.fire({
                    title: 'Хорошо',
                    text: 'Отлично',
                    type: 'info',
                    confirmButtonText: 'Ok'
                });
            }
            else {
                //если в ответе сервера была ошибка
                Swal.fire({
                    title: 'Внимание',
                    text: 'Проблема с отправкой',
                    type: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        })
}