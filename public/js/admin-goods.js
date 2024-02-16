document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.btn-primary');

    editButtons.forEach(function(editButton) {
        editButton.addEventListener('click', function(event) {
            event.preventDefault();

            // Получаем родительский элемент категории
            const categoryCard = editButton.closest('.category');

            // Получаем текст текущей категории
            const currentCategory = categoryCard.querySelector('.card-text').textContent.trim();

            // Отображаем модальное окно
            const modal = document.getElementById('editModal');
            modal.style.display = 'block';

            // Заполняем поле в модальном окне текущим значением категории
            const categoryInput = modal.querySelector('input[name="newCategory"]');
            categoryInput.value = currentCategory;

            const categoryId = editButton.dataset.categoryId;

            // Обработчик для кнопки "Изменить" в модальном окне
            const saveButton = modal.querySelector('.save-button');
            saveButton.addEventListener('click', function() {
                const newCategory = categoryInput.value;
                console.log(newCategory);
                // Отправляем данные на сервер для обновления категории
                fetch(`/admin-goods/${categoryId}/edit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newCategory: newCategory }),
                    
                })
                .then(response => {
                    if (response.ok) {
                        // Обработка успешного ответа от сервера
                        modal.style.display = 'none'; // Скрываем модальное окно после успешного изменения
                    } else {
                        throw new Error('Ошибка при отправке запроса на сервер');
                    }
                })
                .catch(error => {
                    console.error('Произошла ошибка:', error);
                });
            });

            // Обработчик для кнопки "Отменить" в модальном окне
            const cancelButton = modal.querySelector('.cancel-button');
            cancelButton.addEventListener('click', function() {
                modal.style.display = 'none'; // Скрываем модальное окно при отмене
            });
        });
    });
});
