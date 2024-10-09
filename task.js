(function() {
    console.log('Скрипт task.js загружен');
    const bonusButtons = document.querySelectorAll('.bonus-item');
    const bonusValues = [500, 1000, 7000, 15000, 45000, 75000, 125000];
    
    console.log('Найдено кнопок бонуса:', bonusButtons.length);

    function claimBonus(event, index) {
        console.log('Функция claimBonus вызвана');
        const button = event.currentTarget;
        
        // Проверяем, не была ли кнопка уже нажата
        if (button.classList.contains('claimed')) {
            console.log('Бонус уже получен');
            return;
        }
        
        const bonusAmount = bonusValues[index];
    
        console.log('Получение бонуса:', bonusAmount);
    
        let balance = parseInt(localStorage.getItem('balance')) || 0;
        balance += bonusAmount;
        localStorage.setItem('balance', balance.toString());
        
        // Отправляем сообщение родительскому окну для обновления баланса
        window.parent.postMessage({ type: 'updateBalance', balance: balance }, '*');
        
        localStorage.setItem('lastBonusDate', new Date().toDateString());
        localStorage.setItem('lastBonusIndex', index.toString());
    
        // Помечаем кнопку как использованную
        button.classList.add('claimed');
        button.disabled = true;
    
        updateBonusButtons();
        showBonusPopup(bonusAmount);
    }
    
    function updateBonusButtons() {
        const lastBonusDate = localStorage.getItem('lastBonusDate');
        const lastBonusIndex = parseInt(localStorage.getItem('lastBonusIndex')) || -1;
        const today = new Date().toDateString();
    
        console.log('Обновление кнопок бонуса');
        console.log('Последняя дата бонуса:', lastBonusDate);
        console.log('Последний индекс бонуса:', lastBonusIndex);
        console.log('Сегодня:', today);
    
        bonusButtons.forEach((button, index) => {
            console.log(`Обработка кнопки ${index}:`, button.classList.toString());
            
            if (lastBonusDate !== today && index === lastBonusIndex + 1) {
                button.classList.remove('locked');
                button.classList.add('unlocked');
                button.classList.remove('claimed');
                button.disabled = false;
            } else if (index > lastBonusIndex + 1 || lastBonusDate === today) {
                button.classList.remove('unlocked');
                button.classList.add('locked');
                button.disabled = true;
            }
    
            button.onclick = function(event) {
                console.log('Кнопка нажата:', index);
                console.log('Классы кнопки:', button.classList.toString());
                if (!button.classList.contains('locked') && !button.classList.contains('claimed')) {
                    event.preventDefault(); // Предотвращаем повторное срабатывание
                    claimBonus(event, index);
                } else {
                    console.log('Кнопка заблокирована или уже использована');
                }
            };
            
            console.log(`Кнопка ${index} после обработки:`, button.classList.toString());
        });
    }

    function showBonusPopup(amount) {
        console.log('Показ попапа с суммой:', amount);
        const popup = document.createElement('div');
        popup.className = 'bonus-popup';
        popup.innerHTML = `
            <div class="bonus-popup-content">
                <h2>Бонус получен!</h2>
                <p>Вы получили ${amount} LitCoin</p>
                <button class="closePopup">OK</button>
            </div>
        `;
        document.body.appendChild(popup);
    
        // Используем делегирование событий и предотвращаем всплытие
        popup.addEventListener('click', function(event) {
            if (event.target.classList.contains('closePopup')) {
                console.log('Кнопка OK нажата');
                event.stopPropagation(); // Предотвращаем всплытие события
                closePopup(popup);
            }
        });
    }
    
    function closePopup(popup) {
        console.log('Закрытие попапа');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }

    updateBonusButtons();

    // Добавляем обработчик для всего контейнера с бонусами
    const dailyBonusContainer = document.querySelector('.daily-bonus');
    if (dailyBonusContainer) {
        dailyBonusContainer.addEventListener('click', function(event) {
            const button = event.target.closest('.bonus-item');
            if (button) {
                console.log('Клик по кнопке бонуса');
                const index = Array.from(bonusButtons).indexOf(button);
                if (index !== -1) {
                    button.onclick(event);
                }
            }
        });
    } else {
        console.error('Контейнер .daily-bonus не найден');
    }
})();