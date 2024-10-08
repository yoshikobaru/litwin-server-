document.addEventListener('DOMContentLoaded', function() {
    const bonus500Button = document.getElementById('bonus500');
    
    bonus500Button.addEventListener('click', function() {
        if (!bonus500Button.disabled) {
            // Получаем текущий баланс из localStorage
            let balance = parseInt(localStorage.getItem('balance')) || 0;
            
            // Увеличиваем баланс на 500
            balance += 500;
            
            // Сохраняем обновленный баланс в localStorage
            localStorage.setItem('balance', balance.toString());
            
            // Отправляем сообщение главной странице об обновлении баланса
            window.parent.postMessage({ type: 'updateBalance', balance: balance }, '*');
            
            // Показываем сообщение о получении бонуса
            alert('Вы получили бонус 500 LitCoin!');
            
            // Обновляем состояние кнопки
            bonus500Button.disabled = true;
            bonus500Button.textContent = 'Получено';
            
            // Сохраняем дату получения бонуса
            localStorage.setItem('lastBonusDate', new Date().toDateString());
        }
    });
    
    // Проверяем, был ли уже получен бонус сегодня
    const lastBonusDate = localStorage.getItem('lastBonusDate');
    const today = new Date().toDateString();
    
    if (lastBonusDate === today) {
        bonus500Button.disabled = true;
        bonus500Button.textContent = 'Получено';
    }
});
