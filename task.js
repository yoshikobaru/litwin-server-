window.addEventListener('message', function(event) {
    if (event.data.type === 'updateTheme') {
        applyTheme(event.data.theme);
    }
});

function applyTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--tertiary-color', theme.tertiary);
}

(function() {
    console.log('Скрипт task.js загружен');
    const bonusButtons = document.querySelectorAll('.bonus-item');
    const bonusValues = [500, 1000, 7000, 15000, 45000, 75000, 125000];
    
    console.log('Найдено кнопок бонуса:', bonusButtons.length);

    function claimBonus(event, index) {
        console.log('Функция claimBonus вызвана для кнопки с индексом:', index);
        const button = event.currentTarget;
        
        if (button.classList.contains('claimed') || button.classList.contains('locked')) {
            console.log('Бонус уже получен или кнопка заблокирована');
            return;
        }
        
        const bonusAmount = bonusValues[index];

        console.log('Получение бонуса:', bonusAmount);

        let balance = parseInt(localStorage.getItem('balance')) || 0;
        balance += bonusAmount;
        localStorage.setItem('balance', balance.toString());
        
        window.parent.postMessage({ type: 'updateBalance', balance: balance }, '*');
        
        localStorage.setItem('lastClaimedIndex', index.toString());
        console.log('Сохранен lastClaimedIndex:', index);
        
        localStorage.setItem('lastClaimTime', new Date().getTime().toString());

        updateBonusButtons();
        showBonusPopup(bonusAmount);
    }
    
    function updateBonusButtons() {
        const lastClaimedIndex = parseInt(localStorage.getItem('lastClaimedIndex')) || -1;
        const lastClaimTime = parseInt(localStorage.getItem('lastClaimTime')) || 0;
        const currentTime = new Date().getTime();

        console.log('Обновление кнопок бонуса');
        console.log('Последний полученный индекс бонуса:', lastClaimedIndex);

        const timeSinceLastClaim = currentTime - lastClaimTime;
        const canClaimNext = timeSinceLastClaim >= 5 * 1000; // 10 секунд в миллисекундах
        console.log('Время с последнего клейма:', timeSinceLastClaim);
        console.log('Можно ли активировать следующую кнопку:', canClaimNext);

        let nextUnlockedIndex = lastClaimedIndex + 1;
        if (canClaimNext && nextUnlockedIndex < bonusButtons.length) {
            console.log('Можно разблокировать следующую кнопку:', nextUnlockedIndex);
        } else {
            console.log('Ожидание кулдауна или все кнопки использованы');
        }

        bonusButtons.forEach((button, index) => {
            console.log(`Кнопка ${index} до обработки:`, button.classList.toString());
            
            if (index < nextUnlockedIndex) {
                button.classList.remove('unlocked', 'locked');
                button.classList.add('claimed');
                button.disabled = true;
            } else if (index === nextUnlockedIndex && canClaimNext) {
                button.classList.remove('locked', 'claimed');
                button.classList.add('unlocked');
                button.disabled = false;
            } else {
                button.classList.remove('unlocked', 'claimed');
                button.classList.add('locked');
                button.disabled = true;
            }

            const img = button.querySelector('img');
            if (img) {
                img.className = button.classList.contains('locked') || button.classList.contains('claimed') ? 'locked-coin' : 'bonus-coin';
            }
            
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

    // Инициализация кнопок при загруке страницы
    function initializeBonusButtons() {
        const lastClaimedIndex = parseInt(localStorage.getItem('lastClaimedIndex')) || -1;
        bonusButtons.forEach((button, index) => {
            if (index <= lastClaimedIndex) {
                button.classList.remove('unlocked', 'locked');
                button.classList.add('claimed');
                button.disabled = true;
            } else if (index === lastClaimedIndex + 1) {
                button.classList.remove('locked', 'claimed');
                button.classList.add('unlocked');
                button.disabled = false;
            } else {
                button.classList.remove('unlocked', 'claimed');
                button.classList.add('locked');
                button.disabled = true;
            }
        });
    }

    initializeBonusButtons();
    updateBonusButtons();

    // Добавляем обработчик для всего контейнера с бонусами
    const dailyBonusContainer = document.querySelector('.daily-bonus');
    if (dailyBonusContainer) {
        dailyBonusContainer.addEventListener('click', function(event) {
            const button = event.target.closest('.bonus-item');
            if (button && button.classList.contains('unlocked')) {
                console.log('Клик по активой кнопке бонуса');
                const index = Array.from(bonusButtons).indexOf(button);
                if (index !== -1) {
                    claimBonus(event, index);
                }
            }
        });
    } else {
        console.error('Контейнер .daily-bonus не найден');
    }

    // Обновляем состояние кнопок каждые 5 секунд
    setInterval(() => {
        console.log('Обновление кнопок:', new Date().toISOString());
        updateBonusButtons();
    }, 5000);
})();