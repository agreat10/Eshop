// Функция для удаления cookie по имени
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
}

// Обработчик события для кнопки "Выйти из админки"
document.getElementById('logoutButton').addEventListener('click', function() {
    deleteCookie('hash');
    deleteCookie('id'); // Удаление cookie с именем 'adminToken'
    // Дополнительные действия, если необходимо
});
