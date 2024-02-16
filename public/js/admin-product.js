document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.querySelector('.btn-success');
    const modal = document.getElementById('addProductModal');
    const productNameInput = document.getElementById('product-name');
    const productNameModal = document.getElementById('product-name-modal');
    addButton.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение кнопки
        console.log('1111111111111');
        modal.style.display = 'block';

        // Передача значения имени товара в модальное окно
        productNameModal.value = productNameInput.value;

        const cancelButton = document.querySelector('.cancel-button');
        const saveButton = document.querySelector('.save-button');

        cancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        saveButton.addEventListener('click', function() {
            const productName = document.getElementById('product-name').value;
            const productDescription = document.getElementById('product-description').value;
            const productPrice = document.getElementById('product-price').value;
            const productCategory = document.getElementById('product-category').value;

            // Отправляем данные на сервер для добавления товара
            fetch('/admin-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: productName,
                    description: productDescription,
                    cost: productPrice,
                    category: productCategory
                }),
            })
            .then(response => {
                if (response.ok) {
                    // Обработка успешного ответа от сервера
                    modal.style.display = 'none'; // Скрываем модальное окно после успешного добавления
                } else {
                    throw new Error('Ошибка при отправке запроса на сервер');
                }
            })
            .catch(error => {
                console.error('Произошла ошибка:', error);
            });
        });
    });
});
