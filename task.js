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
    const bonusValues = [500, 1000, 7000, 15000, 45000, 75000, 125000];
    const cooldownTime = 24 * 60 * 60 * 1000; // 24 часа кулдауна
    const bonusTime = 24 * 60 * 60 * 1000; // 24 часа бонусного времени

    let lastClaimedIndex = -1; // Индекс последнего полученного бонуса
    let lastClaimTime = 0; // Время последнего получения бонуса

    function initializeBonusSystem() {
        bonusButtons = document.querySelectorAll('.bonus-item');
        loadBonusState();
        updateBonusButtons();

        const dailyBonusContainer = document.querySelector('.daily-bonus');
        if (dailyBonusContainer) {
            dailyBonusContainer.addEventListener('click', handleBonusClick);
        }
    }

    function loadBonusState() {
        const state = JSON.parse(localStorage.getItem('bonusState')) || {};
        lastClaimedIndex = state.lastClaimedIndex || 0;
        lastClaimTime = state.lastClaimTime || 0;
    }

    function saveBonusState() {
        const state = {
            lastClaimedIndex: lastClaimedIndex,
            lastClaimTime: lastClaimTime
        };
        localStorage.setItem('bonusState', JSON.stringify(state));
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
        balance=balance+ bonusAmount; // Увеличиваем баланс на сумму бонуса
        localStorage.setItem('balance', balance.toString()); // Сохраняем новый баланс в окльном ранилище

        window.parent.postMessage({ type: 'updateBalance', balance: balance }, '*'); // Отправляем обновленный баланс

        lastClaimedIndex = index; // Обновляем индекс последнего полученного бонуса
        lastClaimTime = Date.now(); // Обновляем время последнего получения бонуса
        saveBonusState(); // Сохраняем состояние бонусов

        updateBonusButtons(); // Обновляем состояние кнопок
        showBonusPopup(bonusAmount); // Показываем всплывающее окно с информацией о бонусе
    }

    function updateBonusButtons() {
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
            lastClaimTime = 0;
            saveBonusState();
            nextUnlockedIndex = 0;
        }

        bonusButtons.forEach((button, index) => {
            if (index === nextUnlockedIndex && !isInCooldown) {
                setButtonState(button, 'unlocked');
            } else if (index <= lastClaimedIndex) {
                setButtonState(button, 'claimed'); // Делаем кнопку неактивной
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
        // Удалите или закомментируйте эот код, чтобы скрыть таймер
        /*
        let timerElement = document.getElementById('bonusTimer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'bonusTimer';
            document.querySelector('.daily-bonus').appendChild(timerElement);
        }
        timerElement.textContent = `Бонусное время: ${seconds} сек`;
        */
    }

    function hideBonusTimer() {
        // Удалите или закомментируйте этот код, чтобы скрыть таймер
        /*
        const timerElement = document.getElementById('bonusTimer');
        if (timerElement) {
            timerElement.remove();
        }
        */
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

        popup.style.backgroundColor = 'var(--tertiary-color)';
        popup.style.color = '#fff';

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
    localStorage.setItem('lastClaimedIndex', '-1');
    localStorage.setItem('lastClaimTime', '0');
    updateBonusButtons();
}

// Выывайте эту функцию при загрузке страницы
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

function initializeTasks() {
    console.log('Инициализация задач');
    // Проверяем состояние заданий в localStorage
    const isTask1Completed = localStorage.getItem('task1Completed') === 'true';
    const isTask4Completed = localStorage.getItem('task4Completed') === 'true';
    
    console.log('Состояние task1Completed:', isTask1Completed);
    console.log('Состояние task4Completed:', isTask4Completed);
    
    const task1Button = document.getElementById('task1Button');
    const task1Element = document.getElementById('task1');
    const task4Button = document.getElementById('task4Button');
    const task4Element = document.getElementById('task4');

    if (task1Button && task1Element) {
        if (isTask1Completed) {
            disableTask1Button(task1Button, task1Element);
        } else {
            enableTask1Button(task1Button, task1Element);
        }
    }

    if (task4Button && task4Element) {
        if (isTask4Completed) {
            disableTask4Button(task4Button, task4Element);
        } else {
            enableTask4Button(task4Button, task4Element);
        }
    }

    // Инициализация других заданий...
    updateTask2State();
    updateTask3State();
}
function handleTask1Click() {
    console.log('Task 1 clicked');
    
    // Открываем ссылку на группу в Telegram
    window.open('https://t.me/litwin_community', '_blank');

    // Обновляем баланс
    let currentBalance = parseInt(localStorage.getItem('balance')) || 0;
    currentBalance += 1000;
    localStorage.setItem('balance', currentBalance.toString());

    // Отмечаем задание как выполненное
    localStorage.setItem('task1Completed', 'true');
    console.log('Задание отмечено как выполненное');

    // Обновляем отображение задания
    const task1Button = document.getElementById('task1Button');
    const task1Element = document.getElementById('task1');
    if (task1Button && task1Element) {
        disableTask1Button(task1Button, task1Element);
    }

    // Отправляем сообщение об обновлении баланса
    window.parent.postMessage({ type: 'updateBalance', balance: currentBalance }, '*');
    
    console.log('New balance:', currentBalance);
}

function disableTask1Button(button, element) {
    button.disabled = true;
    element.classList.add('completed');
    console.log('Кнопка задания деактивирована');
}

function enableTask1Button(button, element) {
    button.disabled = false;
    element.classList.remove('completed');
    console.log('Кнопка задания активирована');
}

// Обновите обработчик событий DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    initializeTasks();
    
    // Добавляем обработчики клика на кнопки заданий
    const task1Button = document.getElementById('task1Button');
    if (task1Button) {
        task1Button.addEventListener('click', handleTask1Click);
    }
    
    const task4Button = document.getElementById('task4Button');
    if (task4Button) {
        task4Button.addEventListener('click', handleTask4Click);
    }
});

// Добавляем функцию для проверки состояния задания
function checkTask1State() {
    const isTask1Completed = localStorage.getItem('task1Completed') === 'true';
    console.log('Проверка состояния task1Completed:', isTask1Completed);
    return isTask1Completed;
}
function checkTask4State() {
    const isTask4Completed = localStorage.getItem('task4Completed') === 'true';
    console.log('Проверка состояния task4Completed:', isTask4Completed);
    return isTask4Completed;
}
// Экспортируем функцию для использования в других скриптах
window.checkTask1State = checkTask1State;

let invitedFriendsCount = 0; // Счетчик приглашенных друзей

function updateTask2State() {
    const task2Button = document.getElementById('task2Button');
    const task2Element = document.getElementById('task2');
    const friendsCounter = document.getElementById('friendsCounter'); // Получаем элемент счетчика

    friendsCounter.textContent = `${invitedFriendsCount}/3`; // Обновляем текст счетчика

    if (invitedFriendsCount >= 3) {
        task2Button.disabled = false;
        task2Element.classList.remove('completed');
    } else {
        task2Button.disabled = true;
        task2Element.classList.add('completed');
    }
}

function handleTask2Click() {
    if (invitedFriendsCount >= 3) {
        const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
        const newBalance = currentBalance + 10000;
        localStorage.setItem('balance', newBalance.toString());
        alert('Вы получили 10,000 монет!');
        updateTask2State(); // Обновляем состояние задания
    }
}

// Вызовите эту функцию, когда пользователь приглашает друга
function onFriendInvited() {
    invitedFriendsCount++;
    updateTask2State(); // Обновляем состояние задания
}

function updateTask3State() {
    const task3Button = document.getElementById('task3Button');
    const currentLevel = parseInt(localStorage.getItem('currentLevel')) || 1; // Получаем текущий уровень
    const isTask3Completed = localStorage.getItem('task3Completed') === 'true'; // Проверяем состояние задания

    if (isTask3Completed) {
        task3Button.disabled = true; // Деактивируем кнопку, если задание уже выполнено
        task3Button.classList.add('completed'); // Добавляем класс для серого цвета
    } else if (currentLevel > 1) {
        task3Button.disabled = false; // Активируем кнопку, если уровень больше 1 и задание не выполнено
    } else {
        task3Button.disabled = true; // Деактивируем кнопку, если уровень 1 или меньше
    }
}

function handleTask3Click() {
    const currentLevel = parseInt(localStorage.getItem('currentLevel')) || 1; // Получаем текущий уровень
    const isTask3Completed = localStorage.getItem('task3Completed') === 'true'; // Проверяем состояние задания

    if (currentLevel > 1 && !isTask3Completed) {
        const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
        const newBalance = currentBalance + 7000;
        localStorage.setItem('balance', newBalance.toString());
        localStorage.setItem('task3Completed', 'true'); // Устанавливаем состояние задания как выполненное
        alert('Вы получили 7000 монет!');
        updateBalanceDisplay(newBalance); // Обновляем отображение баланса
        updateTask3State(); // Обновляем состояние задания
    }
}

function handleTask4Click() {
    console.log('Task 4 clicked');
    
    // Открываем ссылку на группу Method в Telegram
    window.open('https://t.me/method_community', '_blank');

    // Обновляем баланс
    let currentBalance = parseInt(localStorage.getItem('balance')) || 0;
    currentBalance += 1000;
    localStorage.setItem('balance', currentBalance.toString());

    // Отмечаем задание как выполненное
    localStorage.setItem('task4Completed', 'true');
    console.log('Задание 4 отмечено как выполненное');

    // Обновляем отображение задания
    const task4Button = document.getElementById('task4Button');
    const task4Element = document.getElementById('task4');
    if (task4Button && task4Element) {
        disableTask4Button(task4Button, task4Element);
    }

    // Отправляем сообщение об обновлении баланса
    window.parent.postMessage({ type: 'updateBalance', balance: currentBalance }, '*');
    
    console.log('New balance:', currentBalance);
}

function disableTask4Button(button, element) {
    button.disabled = true;
    element.classList.add('completed');
    console.log('Кнопка задания 4 деактивирована');
}

function enableTask4Button(button, element) {
    button.disabled = false;
    element.classList.remove('completed');
    console.log('Кнопка задания 4 активирована');
}



// Обновите обработчик событий DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    initializeTasks();
    
    // Добавляем обработчики клика на кнопки заданий
    const task1Button = document.getElementById('task1Button');
    if (task1Button) {
        task1Button.addEventListener('click', handleTask1Click);
    }
    
    const task4Button = document.getElementById('task4Button');
    if (task4Button) {
        task4Button.addEventListener('click', handleTask4Click);
    }
});

// Экспортируем функции для использования в других скриптах
window.checkTask1State = checkTask1State;
window.checkTask4State = checkTask4State;