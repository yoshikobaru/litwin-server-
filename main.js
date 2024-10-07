let progressBar, balanceElement, canElement, energyElement, bubblesContainer;
let progress, balance, energy, hourlyProfit, tapProfit;
const clicksToFill = 10;

let lastExitTime, accumulatedCoins;
let totalEarnedCoins;
const progressLevels = [100000, 500000, 1000000, 5000000, 10000000];

let isOnline = true;

function initializeMainPage() {
    progressBar = document.getElementById('progressBar');
    balanceElement = document.getElementById('balance');
    canElement = document.getElementById('can');
    energyElement = document.getElementById('energy');
    bubblesContainer = document.querySelector('.bubbles');

    // Загрузка данных из localStorage
    balance = parseInt(localStorage.getItem('balance')) || 0;
    energy = parseInt(localStorage.getItem('energy')) || 100;
    hourlyProfit = parseInt(localStorage.getItem('hourlyProfit')) || 0;
    tapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

    lastExitTime = parseInt(localStorage.getItem('lastExitTime')) || Date.now();
    accumulatedCoins = parseFloat(localStorage.getItem('accumulatedCoins')) || 0;
    totalEarnedCoins = parseInt(localStorage.getItem('totalEarnedCoins')) || 0;

    calculateOfflineEarnings();
    startOfflineEarningInterval();

    // Устанавливаем флаг, что пользователь онлайн
    isOnline = true;

    updateProgress();
    updateBalance();
    updateEnergy();
    updateHourlyProfit();
    updateTapProfit();

    canElement.addEventListener('click', handleCanClick);

    // Добавляем обработчик событий для кнопок футера
    document.querySelectorAll('.footer-btn').forEach(btn => {
        btn.addEventListener('click', handleFooterButtonClick);
    });
}

function updateProgress() {
    let currentLevel = 0;
    for (let i = 0; i < progressLevels.length; i++) {
        if (totalEarnedCoins >= progressLevels[i]) {
            currentLevel = i + 1;
        } else {
            break;
        }
    }

    let progressPercentage;
    if (currentLevel === progressLevels.length) {
        progressPercentage = 100;
    } else {
        const levelStart = currentLevel > 0 ? progressLevels[currentLevel - 1] : 0;
        const levelEnd = progressLevels[currentLevel];
        progressPercentage = ((totalEarnedCoins - levelStart) / (levelEnd - levelStart)) * 100;
    }

    progressBar.style.width = `${progressPercentage}%`;
    
    // Обновляем отображение текущего уровня прогресса
    const levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) {
        levelDisplay.textContent = `Liga ${currentLevel + 1}`;
    }

    localStorage.setItem('totalEarnedCoins', totalEarnedCoins.toString());
}

function updateBalance() {
    balanceElement.textContent = balance.toLocaleString();
    localStorage.setItem('balance', balance.toString());
}

function updateHourlyProfit() {
    const hourlyProfitElement = document.getElementById('hourlyProfit');
    if (hourlyProfitElement) {
        hourlyProfitElement.textContent = hourlyProfit;
    }
    localStorage.setItem('hourlyProfit', hourlyProfit.toString());
}

function updateTapProfit() {
    // Обновляем значение в профиле
    const tapProfitProfileElement = document.querySelector('.profit-item:first-child .profit-value');
    if (tapProfitProfileElement) {
        tapProfitProfileElement.innerHTML = `<img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span>${tapProfit}</span>`;
    }

    // Обновляем значение, которое отображается при нажатии на банку
    const tapProfitElement = document.getElementById('tapProfit');
    if (tapProfitElement) {
        tapProfitElement.textContent = tapProfit;
    }

    localStorage.setItem('tapProfit', tapProfit.toString());
}

function updateEnergy() {
    energyElement.textContent = `${energy}/100`;
    localStorage.setItem('energy', energy.toString());
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const size = Math.random() * 10 + 5;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    const startAngle = Math.random() * Math.PI * 2;
    const startRadius = 75; // Половина ширины банки
    const endRadius = 100 + Math.random() * 50;
    
    const startX = Math.cos(startAngle) * startRadius;
    const startY = Math.sin(startAngle) * startRadius;
    
    bubble.style.left = `calc(50% + ${startX}px)`;
    bubble.style.top = `calc(50% + ${startY}px)`;
    
    const endX = Math.cos(startAngle) * endRadius;
    const endY = Math.sin(startAngle) * endRadius;
    
    const tx = endX - startX;
    const ty = endY - startY;
    
    bubble.style.setProperty('--tx', `${tx}px`);
    bubble.style.setProperty('--ty', `${ty}px`);
    
    bubblesContainer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1000);
}

function handleCanClick() {
    if (energy > 0) {
        canElement.classList.add('shake');
        setTimeout(() => canElement.classList.remove('shake'), 200);

        for (let i = 0; i < 15; i++) {
            setTimeout(() => createBubble(), Math.random() * 200);
        }

        totalEarnedCoins += tapProfit;
        balance += tapProfit;
        updateProgress();
        updateBalance();

        energy -= 1;
        updateEnergy();

        showTapProfit();
    }
}

function showTapProfit() {
    const profitElement = document.createElement('div');
    profitElement.className = 'tap-profit';
    profitElement.textContent = `+${tapProfit}`; // Используем tapProfit

    // Позиционируем элемент рядом с банкой
    const canRect = canElement.getBoundingClientRect();
    profitElement.style.left = `${canRect.left + canRect.width / 2}px`;
    profitElement.style.top = `${canRect.top - 20}px`;

    document.body.appendChild(profitElement);

    // Анимация исчезновения
    setTimeout(() => {
        profitElement.style.opacity = '0';
        profitElement.style.transform = 'translateY(-20px)';
        setTimeout(() => profitElement.remove(), 500);
    }, 10);
}

function regenerateEnergy() {
    if (energy < 100) {
        energy = Math.min(energy + 1, 100);
        updateEnergy();
    }
}

function handleFooterButtonClick(event) {
    const page = event.target.dataset.page;
    if (page === 'collection') {
        loadCollectionPage();
    } else if (page === 'main') {
        loadMainPage();
    } else {
        // Обработка других страниц (если необходимо)
        console.log(`Перход на страницу: ${page}`);
    }

    // Обновляем активную кнопку
    document.querySelectorAll('.footer-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function loadCollectionPage() {
    fetch('collection.html')
        .then(response => response.text())
        .then(html => {
            document.querySelector('.container').innerHTML = html;
            const script = document.createElement('script');
            script.src = 'collection.js';
            document.body.appendChild(script);
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'collection.css';
            document.head.appendChild(link);
        })
        .catch(error => console.error('Ошибка загрузки страницы коллекции:', error));
}

function loadMainPage() {
    fetch('main.html')
        .then(response => response.text())
        .then(html => {
            document.querySelector('.container').innerHTML = html;
            initializeMainPage();
        })
        .catch(error => console.error('Ошибка загрузки главной страницы:', error));
}

// Инициализация главной страницы при згрузке
document.addEventListener('DOMContentLoaded', initializeMainPage);

// Запуск регенерации энергии
setInterval(regenerateEnergy, 5000);

function calculateOfflineEarnings() {
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastExitTime) / 1000; // разница в секундах
    const maxOfflineTime = 5 * 60 * 60; // 5 часов в секундах

    if (timeDiff > 0) {
        const earnedCoins = Math.min(timeDiff, maxOfflineTime) * (hourlyProfit / 3600);
        accumulatedCoins += earnedCoins;
        balance += Math.floor(accumulatedCoins);
        totalEarnedCoins += Math.floor(accumulatedCoins);
        accumulatedCoins -= Math.floor(accumulatedCoins);
        updateBalance();
        updateProgress();
    }

    lastExitTime = currentTime;
    localStorage.setItem('lastExitTime', lastExitTime.toString());
    localStorage.setItem('accumulatedCoins', accumulatedCoins.toString());
}

function startOfflineEarningInterval() {
    setInterval(() => {
        if (!isOnline) {
            const earnedCoins = (hourlyProfit / 3600) * (1 / 60); // монеты за 1 секунду
            accumulatedCoins += earnedCoins;
            if (accumulatedCoins >= 1) {
                const earnedWholeCoins = Math.floor(accumulatedCoins);
                balance += earnedWholeCoins;
                totalEarnedCoins += earnedWholeCoins;
                accumulatedCoins -= earnedWholeCoins;
                updateBalance();
                updateProgress();
            }
            localStorage.setItem('accumulatedCoins', accumulatedCoins.toString());
        }
    }, 1000); // обновляем каждую секунду
}

// Добавьте эту функцию для сохранения времени выхода
function saveExitTime() {
    isOnline = false;
    localStorage.setItem('lastExitTime', Date.now().toString());
}

// Вызывайте эту функцию при закрытии страницы
window.addEventListener('beforeunload', saveExitTime);

// Добавьте эту функцию для обработки возвращения в игру
window.addEventListener('focus', () => {
    if (!isOnline) {
        isOnline = true;
        calculateOfflineEarnings();
    }
});