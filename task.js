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
    let bonusButtons;
    const bonusValues = [500, 1000, 1500, 2000, 2500, 3000, 3500];
    let lastClaimedIndex = parseInt(localStorage.getItem('lastClaimedIndex')) || -1;
    const cooldownTime = 5 * 1000; // 5 секунд кулдауна
    const bonusTime = 10 * 1000; // 10 секунд бонусного времени
    
    function initializeBonusSystem() {
        bonusButtons = document.querySelectorAll('.bonus-item');
        updateBonusButtons();
        
        const dailyBonusContainer = document.querySelector('.daily-bonus');
        if (dailyBonusContainer) {
            dailyBonusContainer.addEventListener('click', handleBonusClick);
        }
    }

    function handleBonusClick(event) {
        const button = event.target.closest('.bonus-item');
        if (button && button.classList.contains('unlocked')) {
            const index = Array.from(bonusButtons).indexOf(button);
            if (index !== -1) {
                claimBonus(index);
            }
        }
    }

    function claimBonus(index) {
        const bonusAmount = bonusValues[index];
        let balance = parseInt(localStorage.getItem('balance')) || 0;
        balance += bonusAmount;
        localStorage.setItem('balance', balance.toString());
        
        window.parent.postMessage({ type: 'updateBalance', balance: balance }, '*');
        
        lastClaimedIndex = index;
        localStorage.setItem('lastClaimedIndex', lastClaimedIndex.toString());
        localStorage.setItem('lastClaimTime', Date.now().toString());

        updateBonusButtons();
        showBonusPopup(bonusAmount);
    }
    
    function updateBonusButtons() {
        const lastClaimTime = parseInt(localStorage.getItem('lastClaimTime')) || 0;
        const currentTime = Date.now();
        const timeSinceLastClaim = currentTime - lastClaimTime;

        let nextUnlockedIndex = lastClaimedIndex + 1;
        if (nextUnlockedIndex >= bonusButtons.length) {
            nextUnlockedIndex = 0;
        }

        const isInCooldown = timeSinceLastClaim < cooldownTime;
        const isInBonusTime = timeSinceLastClaim >= cooldownTime && timeSinceLastClaim < (cooldownTime + bonusTime);

        // Проверяем, закончилось ли бонусное время
        if (timeSinceLastClaim >= (cooldownTime + bonusTime)) {
            // Сбрасываем на первую кнопку
            lastClaimedIndex = -1;
            localStorage.setItem('lastClaimedIndex', '-1');
            nextUnlockedIndex = 0;
        }

        bonusButtons.forEach((button, index) => {
            if (index === nextUnlockedIndex && !isInCooldown) {
                setButtonState(button, 'unlocked');
            } else if (index <= lastClaimedIndex) {
                setButtonState(button, 'claimed');
            } else {
                setButtonState(button, 'locked');
            }
        });

        if (isInBonusTime) {
            const remainingTime = Math.ceil((cooldownTime + bonusTime - timeSinceLastClaim) / 1000);
            updateBonusTimer(remainingTime);
        } else {
            hideBonusTimer();
        }
    }

    function setButtonState(button, state) {
        button.classList.remove('claimed', 'unlocked', 'locked');
        button.classList.add(state);
        const img = button.querySelector('img');
        if (img) {
            img.className = state === 'locked' || state === 'claimed' ? 'locked-coin' : 'bonus-coin';
        }
    }

    function updateBonusTimer(seconds) {
        let timerElement = document.getElementById('bonusTimer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'bonusTimer';
            document.querySelector('.daily-bonus').appendChild(timerElement);
        }
        timerElement.textContent = `Бонусное время: ${seconds} сек`;
    }

    function hideBonusTimer() {
        const timerElement = document.getElementById('bonusTimer');
        if (timerElement) {
            timerElement.remove();
        }
    }

    function showBonusPopup(amount) {
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

        popup.querySelector('.closePopup').addEventListener('click', () => {
            popup.remove();
        });
    }

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', initializeBonusSystem);

    // Обновляем состояние кнопок каждую секунду
    setInterval(updateBonusButtons, 1000);
})();

// Добавьте эту функцию для сброса бонусов (например, раз в день)
function resetBonuses() {
    lastClaimedIndex = -1;
    localStorage.setItem('lastClaimedIndex', '-1');
    localStorage.setItem('lastClaimTime', '0');
    updateBonusButtons();
}

// Вызывайте эту функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeBonusSystem();
    
    // Проверка и сброс бонусов раз в день
    const lastResetDate = localStorage.getItem('lastResetDate');
    const currentDate = new Date().toDateString();
    if (lastResetDate !== currentDate) {
        resetBonuses();
        localStorage.setItem('lastResetDate', currentDate);
    }
});

// Обновляем состояние кнопок каждые 5 секунд
setInterval(updateBonusButtons, 5000);
