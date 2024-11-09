function applyTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--tertiary-color', theme.tertiary);
}

window.addEventListener('message', function(event) {
    if (event.data.type === 'updateTheme') {
        applyTheme(event.data.theme);
        updateUpgradeButtons();
    }
});

function updateUpgradeButtons() {
    const upgradeButtons = document.querySelectorAll('.market-item-buy');
    upgradeButtons.forEach(button => {
        button.style.backgroundColor = 'var(--secondary-color)';
    });
}
const defaultUpgrades = [
    { id: 'drinkLit', title: 'Бахнуть LITWIN', emoji: '🍺' },
    { id: 'improveTap', title: 'Выйти на межпланетарный уровень', emoji: '🌍' },
    { id: 'improveTap1', title: 'Войти в кондиции', emoji: '💪' },
    { id: 'improveTap2', title: 'Аккуратный тап', emoji: '🎯' },
    { id: 'improveTap3', title: 'Родный тап', emoji: '🏠' },
    { id: 'farm', title: 'Построить завод LITWIN', emoji: '🏭' },
    { id: 'hour1', title: 'Заехать в кофеманию', emoji: '☕' },
    { id: 'hour2', title: 'Подписать нового бойца', emoji: '🥊' },
    { id: 'hour3', title: 'Выиграть в футбол медиалиге', emoji: '⚽' },
    { id: 'hour4', title: 'Выиграть гонку', emoji: '🏎️' },
    { id: 'energy', title: 'Заряд энергии', emoji: '⚡' },
    { id: 'starBoost1', title: 'Звездный буст x2', emoji: '⭐', isPremium: true, stars: 100, multiplier: 2 },
    { id: 'starBoost2', title: 'Звездный буст x5', emoji: '🌟', isPremium: true, stars: 250, multiplier: 5 },
    { id: 'starBoost3', title: 'Звездный буст x10', emoji: '✨', isPremium: true, stars: 500, multiplier: 10 }
];
function updateUpgradeElements() {
    const marketItems = document.querySelectorAll('.market-item');
    marketItems.forEach(element => {
        const header = element.querySelector('.market-item-header');
        const button = element.querySelector('.market-item-buy');
        if (header && button) {
            let upgradeId = button.id.replace('Button', '');
            // Для hourData1, hourData2 и т.д. используем специальные id
            if (upgradeId.startsWith('hourButton')) {
                upgradeId = 'hour' + upgradeId.replace('hourButton', '');
            }
            let upgrade = defaultUpgrades.find(u => u.id === upgradeId);
            
            if (!upgrade) {
                // Если улучшение не найдено в списке, создаем для него дефолтный эмодзи
                const title = header.querySelector('.market-item-title').textContent;
                upgrade = { id: upgradeId, title: title, emoji: '🔧' }; // Используем 🔧 как дефолтный эмодзи
            }

            const level = header.querySelector('.market-item-level');
            const title = header.querySelector('.market-item-title');
            const profit = header.querySelector('.market-item-profit');
            
            // Вставляем эмодзи перед заголовком
            title.insertAdjacentHTML('beforebegin', `<span class="market-item-emoji">${upgrade.emoji}</span>`);
        }
    });
}

// Добавьте стили для эмодзи (если еще не добавлены)
const style = document.createElement('style');
style.textContent = `
    .market-item-emoji {
        font-size: 1.2em;
        margin-right: 8px;
        vertical-align: middle;
    }
    .market-item-header {
        display: flex;
        align-items: center;
    }
    .market-item-title {
        flex-grow: 1;
    }
`;
document.head.appendChild(style);

// Вызовите функцию updateUpgradeElements при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        updateUpgradeElements();
        updateUpgradeButtons();
    }, 100); // небольшая задержка для уверенности, что все элементы загружены
});

// Остальной код остается без изменений
(function() {
    const collectionGrid = document.getElementById('collection-grid');
    const marketItems = document.getElementById('market-items');

    const canImages = [
        'assets/bankaClassic.png',
        'assets/bankamango.png',
        'assets/bankablueberry.png',
        'assets/lock.svg',
        'assets/lock.svg',
        'assets/lock.svg',
        'assets/lock.svg',
        'assets/lock.svg'
    ];
    
    // Создаем сетку коллекции
    for (let i = 0; i < 8; i++) {
        const itemElement = document.createElement('div');
        itemElement.className = 'collection-item';
        itemElement.dataset.index = i;

        if (i >= 3) {
            itemElement.classList.add('inactive');
            itemElement.innerHTML = `<img src="${canImages[i]}" alt="Банка ${i + 1}" class="can-icon">`;
        } else {
            itemElement.innerHTML = `<img src="${canImages[i]}" alt="Банка ${i + 1}" class="can-icon">`;
            itemElement.addEventListener('click', function() {
                console.log(`Вы выбрали банку ${i + 1}`);
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            });
        }

        collectionGrid.appendChild(itemElement);
    }
    
    updateUnlockedCans();
    
    // Данные для задания "Выпить LIT"
    const drinkLitData = [
        { level: 1, profit: 1, price: 100 },
        { level: 2, profit: 2, price: 200 },
        { level: 3, profit: 3, price: 400 },
        { level: 4, profit: 4, price: 800 },
        { level: 5, profit: 5, price: 1600 },
        { level: 6, profit: 6, price: 3200 },
        { level: 7, profit: 7, price: 6400 },
        { level: 8, profit: 8, price: 12800 },
        { level: 9, profit: 9, price: 25600 },
        { level: 10, profit: 10, price: 51200 },
    ];
    
    // Новые данные для задания "Улучшить тап"
    const improveTapData = [
        { level: 1, profit: 1, price: 120 },
        { level: 2, profit: 2, price: 250 },
        { level: 3, profit: 3, price: 470 },
        { level: 4, profit: 4, price: 899 },
        { level: 5, profit: 5, price: 1750 },
        { level: 6, profit: 6, price: 4200 },
        { level: 7, profit: 7, price: 7800 },
        { level: 8, profit: 8, price: 14500 },
        { level: 9, profit: 9, price: 27900 },
        { level: 10, profit: 10, price: 55600 },
    ];
    const improveTapData1 = [
        { level: 1, profit: 1, price: 200 },
        { level: 2, profit: 2, price: 340 },
        { level: 3, profit: 3, price: 620 },
        { level: 4, profit: 4, price: 999 },
        { level: 5, profit: 5, price: 1890 },
        { level: 6, profit: 6, price: 5100 },
        { level: 7, profit: 7, price: 8100 },
        { level: 8, profit: 8, price: 16500 },
        { level: 9, profit: 9, price: 28700 },
        { level: 10, profit: 10, price: 55900 },
    ];
    const improveTapData2 = [
        { level: 1, profit: 7, price: 9000 },
        { level: 2, profit: 8, price: 17000 },
        { level: 3, profit: 9, price: 17000 },
        { level: 4, profit: 10, price: 60000 },
        { level: 5, profit: 11, price: 126000 },
        { level: 6, profit: 12, price: 224000 },
        { level: 7, profit: 13, price: 443000 },
        { level: 8, profit: 14, price: 822000 },
        { level: 9, profit: 15, price: 1225000 },
        { level: 10, profit: 16, price: 2342000 },
    ];
    const improveTapData3 = [
        { level: 1, profit: 1, price: 120 },
        { level: 2, profit: 1, price: 250 },
        { level: 3, profit: 2, price: 300 },
        { level: 4, profit: 2, price: 400 },
        { level: 5, profit: 3, price: 500 },
        { level: 6, profit: 3, price: 900 },
        { level: 7, profit: 4, price: 1100 },
        { level: 8, profit: 4, price: 2900 },
        { level: 9, profit: 5, price: 4500 },
        { level: 10, profit: 5, price: 5600 },
    ];
    const improveTapElement = document.createElement('div');
improveTapElement.className = 'market-item';
improveTapElement.innerHTML = `
    <div class="market-item-header">
        <span class="market-item-level">Ур. <span id="improveTapLevel">1</span></span>
        <span class="market-item-title">Выйти на межпланетарный уровень</span>
        <span class="market-item-profit">
            Прибыль за тап <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="improveTapProfit">1</span>
        </span>
    </div>
    <hr class="item-divider">
    <div class="market-item-buy" id="improveTapButton">
        <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
        <span class="price-value" id="improveTapPrice">120</span>
    </div>
`;
marketItems.insertBefore(improveTapElement, marketItems.firstChild);

let currentImproveTapLevel = parseInt(localStorage.getItem('improveTapLevel')) || 0;
function updateImproveTapButton() {
    const improveTapButton = document.getElementById('improveTapButton');
    const improveTapPrice = document.getElementById('improveTapPrice');
    const improveTapLevel = document.getElementById('improveTapLevel');
    const improveTapProfit = document.getElementById('improveTapProfit');

    if (currentImproveTapLevel >= improveTapData.length || localStorage.getItem('improveTapMaxLevel') === 'true') {
        improveTapLevel.textContent = improveTapData[improveTapData.length - 1].level;
        improveTapProfit.textContent = improveTapData[improveTapData.length - 1].profit;
        improveTapPrice.textContent = 'MAX';
        improveTapButton.disabled = true;
        improveTapButton.textContent = 'Максимальный уровень';
        localStorage.setItem('improveTapMaxLevel', 'true');
    } else {
        const nextLevel = improveTapData[currentImproveTapLevel];
        improveTapLevel.textContent = nextLevel.level;
        improveTapProfit.textContent = nextLevel.profit;
        improveTapPrice.textContent = nextLevel.price;
        improveTapButton.disabled = false;
    }
    
    localStorage.setItem('improveTapLevel', currentImproveTapLevel.toString());
}

// Обновите обработчик событий для каждой кнопки улучшения тапов
document.getElementById('improveTapButton').addEventListener('click', function() {
    if (this.disabled) return;
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    const nextLevel = improveTapData[currentImproveTapLevel];
    const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
    const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

    if (currentBalance >= nextLevel.price) {
        const newBalance = currentBalance - nextLevel.price;
        localStorage.setItem('balance', newBalance.toString());

        const newTapProfit = currentTapProfit + nextLevel.profit; // Используем правильное значение прибыли
        localStorage.setItem('tapProfit', newTapProfit.toString());
        
        if (typeof updateTapProfit === 'function') {
            tapProfit = newTapProfit; // Обновляем tapProfit
            updateTapProfit();
        }

        currentImproveTapLevel++;
        if (currentImproveTapLevel >= improveTapData.length) {
            currentImproveTapLevel = improveTapData.length - 1;
            localStorage.setItem('improveTapMaxLevel', 'true');
        }
        updateImproveTapButton();

        updateBalance();

        showPopup('Поздравляем!', `Вы успешно увеличили прибыль за тап на +${nextLevel.profit}!`);
    } else {
        showPopup('Ой!', 'Недостаточно средств для покупки!');
    }
});

if (localStorage.getItem('improveTapMaxLevel') === 'true') {
    currentImproveTapLevel = improveTapData.length - 1;
}
updateImproveTapButton();

const improveTapElement1 = document.createElement('div');
improveTapElement1.className = 'market-item';
improveTapElement1.innerHTML = `
    <div class="market-item-header">
        <span class="market-item-level">Ур. <span id="improveTapLevel1">1</span></span>
        <span class="market-item-title">Войти в кондиции</span>
        <span class="market-item-profit">
            Прибыль за тап <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="improveTapProfit1">1</span>
        </span>
    </div>
    <hr class="item-divider">
    <div class="market-item-buy" id="improveTapButton1">
        <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
        <span class="price-value" id="improveTapPrice1">200</span>
    </div>
`;
marketItems.appendChild(improveTapElement1);

let currentImproveTapLevel1 = parseInt(localStorage.getItem('improveTapLevel1')) || 0;
function updateImproveTapButton1() {
    const improveTapButton1 = document.getElementById('improveTapButton1');
    const improveTapPrice1 = document.getElementById('improveTapPrice1');
    const improveTapLevel1 = document.getElementById('improveTapLevel1');
    const improveTapProfit1 = document.getElementById('improveTapProfit1');

    if (currentImproveTapLevel1 >= improveTapData1.length || localStorage.getItem('improveTapMaxLevel1') === 'true') {
        improveTapLevel1.textContent = improveTapData1[improveTapData1.length - 1].level;
        improveTapProfit1.textContent = improveTapData1[improveTapData1.length - 1].profit;
        improveTapPrice1.textContent = 'MAX';
        improveTapButton1.disabled = true;
        improveTapButton1.textContent = 'Максимальный уровень';
        localStorage.setItem('improveTapMaxLevel1', 'true');
    } else {
        const nextLevel = improveTapData1[currentImproveTapLevel1];
        improveTapLevel1.textContent = nextLevel.level;
        improveTapProfit1.textContent = nextLevel.profit;
        improveTapPrice1.textContent = nextLevel.price;
        improveTapButton1.disabled = false;
    }
    
    localStorage.setItem('improveTapLevel1', currentImproveTapLevel1.toString());
}

// Поторите аналогичные изменения для других кнопок улучшения тапов
document.getElementById('improveTapButton1').addEventListener('click', function() {
    if (this.disabled) return;

    const nextLevel = improveTapData1[currentImproveTapLevel1];
    const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
    const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

    if (currentBalance >= nextLevel.price) {
        const newBalance = currentBalance - nextLevel.price;
        localStorage.setItem('balance', newBalance.toString());

        const newTapProfit = currentTapProfit + nextLevel.profit; // Используем правильное значение прибыли
        localStorage.setItem('tapProfit', newTapProfit.toString());
        
        if (typeof updateTapProfit === 'function') {
            tapProfit = newTapProfit; // Обновляем tapProfit
            updateTapProfit();
        }

        currentImproveTapLevel1++;
        if (currentImproveTapLevel1 >= improveTapData1.length) {
            currentImproveTapLevel1 = improveTapData1.length - 1;
            localStorage.setItem('improveTapMaxLevel1', 'true');
        }
        updateImproveTapButton1();

        updateBalance();

        showPopup('Поздравляем!', `Вы успешно увеличили прибыль за тап на +${nextLevel.profit}!`);
    } else {
        showPopup('Ой!', 'Недостаточно средств для покупки!');
    }
});

if (localStorage.getItem('improveTapMaxLevel1') === 'true') {
    currentImproveTapLevel1 = improveTapData1.length - 1;
}
updateImproveTapButton1();

// Создание кнопки для улучшения тап 2
const improveTapElement2 = document.createElement('div');
improveTapElement2.className = 'market-item';
improveTapElement2.innerHTML = `
    <div class="market-item-header">
        <span class="market-item-level">Ур. <span id="improveTapLevel2">1</span></span>
        <span class="market-item-title">Аккуратный тап</span>
        <span class="market-item-profit">
            Прибыль за тап <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="improveTapProfit2">1</span>
        </span>
    </div>
    <hr class="item-divider">
    <div class="market-item-buy" id="improveTapButton2">
        <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
        <span class="price-value" id="improveTapPrice2">9000</span>
    </div>
`;
marketItems.appendChild(improveTapElement2);

let currentImproveTapLevel2 = parseInt(localStorage.getItem('improveTapLevel2')) || 0;
function updateImproveTapButton2() {
    const improveTapButton2 = document.getElementById('improveTapButton2');
    const improveTapPrice2 = document.getElementById('improveTapPrice2');
    const improveTapLevel2 = document.getElementById('improveTapLevel2');
    const improveTapProfit2 = document.getElementById('improveTapProfit2');

    if (currentImproveTapLevel2 >= improveTapData2.length || localStorage.getItem('improveTapMaxLevel2') === 'true') {
        improveTapLevel2.textContent = improveTapData2[improveTapData2.length - 1].level;
        improveTapProfit2.textContent = improveTapData2[improveTapData2.length - 1].profit;
        improveTapPrice2.textContent = 'MAX';
        improveTapButton2.disabled = true;
        improveTapButton2.textContent = 'Максимальный уровень';
        localStorage.setItem('improveTapMaxLevel2', 'true');
    } else {
        const nextLevel = improveTapData2[currentImproveTapLevel2];
        improveTapLevel2.textContent = nextLevel.level;
        improveTapProfit2.textContent = nextLevel.profit;
        improveTapPrice2.textContent = nextLevel.price;
        improveTapButton2.disabled = false;
    }
    
    localStorage.setItem('improveTapLevel2', currentImproveTapLevel2.toString());
}

// Аналогично для improveTapButton2
document.getElementById('improveTapButton2').addEventListener('click', function() {
    if (this.disabled) return;

    const nextLevel = improveTapData2[currentImproveTapLevel2];
    const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
    const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

    if (currentBalance >= nextLevel.price) {
        const newBalance = currentBalance - nextLevel.price;
        localStorage.setItem('balance', newBalance.toString());

        const newTapProfit = currentTapProfit + nextLevel.profit; // Используем правильное значение прибыли
        localStorage.setItem('tapProfit', newTapProfit.toString());
        
        if (typeof updateTapProfit === 'function') {
            tapProfit = newTapProfit; // Обновляем tapProfit
            updateTapProfit();
        }

        currentImproveTapLevel2++;
        if (currentImproveTapLevel2 >= improveTapData2.length) {
            currentImproveTapLevel2 = improveTapData2.length - 1;
            localStorage.setItem('improveTapMaxLevel2', 'true');
        }
        updateImproveTapButton2();

        updateBalance();

        showPopup('Поздравляем!', `Вы успешно увеличили прибыль за тап на +${nextLevel.profit}!`);
    } else {
        showPopup('Ой!', 'Недостаточно средств для покупки!');
    }
});

if (localStorage.getItem('improveTapMaxLevel2') === 'true') {
    currentImproveTapLevel2 = improveTapData2.length - 1;
}
updateImproveTapButton2();

// Создание кнопки для улучшения тап 3
const improveTapElement3 = document.createElement('div');
improveTapElement3.className = 'market-item';
improveTapElement3.innerHTML = `
    <div class="market-item-header">
        <span class="market-item-level">Ур. <span id="improveTapLevel3">1</span></span>
        <span class="market-item-title">Родный тап</span>
        <span class="market-item-profit">
            Прибыль за тап <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="improveTapProfit3">1</span>
        </span>
    </div>
    <hr class="item-divider">
    <div class="market-item-buy" id="improveTapButton3">
        <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
        <span class="price-value" id="improveTapPrice3">120</span>
    </div>
`;
marketItems.appendChild(improveTapElement3);

let currentImproveTapLevel3 = parseInt(localStorage.getItem('improveTapLevel3')) || 0;
function updateImproveTapButton3() {
    const improveTapButton3 = document.getElementById('improveTapButton3');
    const improveTapPrice3 = document.getElementById('improveTapPrice3');
    const improveTapLevel3 = document.getElementById('improveTapLevel3');
    const improveTapProfit3 = document.getElementById('improveTapProfit3');

    if (currentImproveTapLevel3 >= improveTapData3.length || localStorage.getItem('improveTapMaxLevel3') === 'true') {
        improveTapLevel3.textContent = improveTapData3[improveTapData3.length - 1].level;
        improveTapProfit3.textContent = improveTapData3[improveTapData3.length - 1].profit;
        improveTapPrice3.textContent = 'MAX';
        improveTapButton3.disabled = true;
        improveTapButton3.textContent = 'Максимальный уровень';
        localStorage.setItem('improveTapMaxLevel3', 'true');
    } else {
        const nextLevel = improveTapData3[currentImproveTapLevel3];
        improveTapLevel3.textContent = nextLevel.level;
        improveTapProfit3.textContent = nextLevel.profit;
        improveTapPrice3.textContent = nextLevel.price;
        improveTapButton3.disabled = false;
    }
    
    localStorage.setItem('improveTapLevel3', currentImproveTapLevel3.toString());
}

// Аналогично для improveTapButton3
document.getElementById('improveTapButton3').addEventListener('click', function() {
    if (this.disabled) return;

    const nextLevel = improveTapData3[currentImproveTapLevel3];
    const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
    const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

    if (currentBalance >= nextLevel.price) {
        const newBalance = currentBalance - nextLevel.price;
        localStorage.setItem('balance', newBalance.toString());

        const newTapProfit = currentTapProfit + nextLevel.profit; // Используем правильное значение прибыли
        localStorage.setItem('tapProfit', newTapProfit.toString());
        
        if (typeof updateTapProfit === 'function') {
            tapProfit = newTapProfit; // Обновляем tapProfit
            updateTapProfit();
        }

        currentImproveTapLevel3++;
        if (currentImproveTapLevel3 >= improveTapData3.length) {
            currentImproveTapLevel3 = improveTapData3.length - 1;
            localStorage.setItem('improveTapMaxLevel3', 'true');
        }
        updateImproveTapButton3();

        updateBalance();

        showPopup('Поздравляем!', `Вы успешно увеличили прибыль за тап на +${nextLevel.profit}!`);
    } else {
        showPopup('Ой!', 'Недостаточно средств для покупки!');
    }
});

if (localStorage.getItem('improveTapMaxLevel3') === 'true') {
    currentImproveTapLevel3 = improveTapData3.length - 1;
}
updateImproveTapButton3();

// Обновите функцию initializeMarketItems(), чтобы добавить новые кнопки
function initializeMarketItems() {
    // ... существующий код ...

    updateDrinkLitButton();
    updateImproveTapButton();
    updateImproveTapButton1();
    updateImproveTapButton2();
    updateImproveTapButton3();
}

// Вызовите initializeMarketItems() при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeMarketItems);
    
    const drinkLitElement = document.createElement('div');
    drinkLitElement.className = 'market-item';
    drinkLitElement.innerHTML = `
        <div class="market-item-header">
            <span class="market-item-level">Ур. <span id="drinkLitLevel">1</span></span>
            <span class="market-item-title">Бахнуть LITWIN</span>
            <span class="market-item-profit">
                Прибыль за тап <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="drinkLitProfit">1</span>
            </span>
        </div>
        <hr class="item-divider">
        <div class="market-item-buy" id="drinkLitButton">
            <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
            <span class="price-value" id="drinkLitPrice">100</span>
        </div>
    `;
    marketItems.insertBefore(drinkLitElement, marketItems.firstChild);

    let currentDrinkLitLevel = parseInt(localStorage.getItem('drinkLitLevel')) || 0;
    function updateDrinkLitButton() {
        const drinkLitButton = document.getElementById('drinkLitButton');
        const drinkLitPrice = document.getElementById('drinkLitPrice');
        const drinkLitLevel = document.getElementById('drinkLitLevel');
        const drinkLitProfit = document.getElementById('drinkLitProfit');

        if (currentDrinkLitLevel >= drinkLitData.length || localStorage.getItem('drinkLitMaxLevel') === 'true') {
            drinkLitLevel.textContent = drinkLitData[drinkLitData.length - 1].level;
            drinkLitProfit.textContent = drinkLitData[drinkLitData.length - 1].profit;
            drinkLitPrice.textContent = 'MAX';
            drinkLitButton.disabled = true;
            drinkLitButton.textContent = 'Максимальный уровень';
            localStorage.setItem('drinkLitMaxLevel', 'true');
        } else {
            const nextLevel = drinkLitData[currentDrinkLitLevel];
            drinkLitLevel.textContent = nextLevel.level;
            drinkLitProfit.textContent = nextLevel.profit;
            drinkLitPrice.textContent = nextLevel.price;
            drinkLitButton.disabled = false;
        }
        
        localStorage.setItem('drinkLitLevel', currentDrinkLitLevel.toString());
    }

    document.getElementById('drinkLitButton').addEventListener('click', function() {
        if (this.disabled) return;

        const nextLevel = drinkLitData[currentDrinkLitLevel];
        const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
        const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

        if (currentBalance >= nextLevel.price) {
            const newBalance = currentBalance - nextLevel.price;
            localStorage.setItem('balance', newBalance.toString());

            const newTapProfit = currentTapProfit + nextLevel.profit;
            localStorage.setItem('tapProfit', newTapProfit.toString());
            
            if (typeof updateTapProfit === 'function') {
                tapProfit = newTapProfit;
                updateTapProfit();
            }

            currentDrinkLitLevel++;
            if (currentDrinkLitLevel >= drinkLitData.length) {
                currentDrinkLitLevel = drinkLitData.length - 1;
                localStorage.setItem('drinkLitMaxLevel', 'true');
            }
            updateDrinkLitButton();

            updateBalance();

            showPopup('Поздравляем!', `Вы успешно увеличили прибыль за тап на +${nextLevel.profit}!`);
        } else {
            showPopup('Ой!', 'Недостаточно средств для покупки!');
        }
    });

    if (localStorage.getItem('drinkLitMaxLevel') === 'true') {
        currentDrinkLitLevel = drinkLitData.length - 1;
    } 
    updateDrinkLitButton();
    








    const farmData = [
        { level: 1, profit: 100, price: 100 },
        { level: 2, profit: 200, price: 200 },
        { level: 3, profit: 300, price: 400 },
        { level: 4, profit: 400, price: 800 },
        { level: 5, profit: 500, price: 1600 },
        { level: 6, profit: 600, price: 3200 },
        { level: 7, profit: 700, price: 6400 },
        { level: 8, profit: 800, price: 12800 },
        { level: 9, profit: 900, price: 25600 },
        { level: 10, profit: 1000, price: 51200 },
    ];
    
    const farmElement = document.createElement('div');
    farmElement.className = 'market-item';
    farmElement.innerHTML = `
        <div class="market-item-header">
            <span class="market-item-level">Ур. <span id="farmLevel">1</span></span>
            <span class="market-item-title">Построить завод LITWIN</span>
            <span class="market-item-profit">
                Прибыль в час <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="farmProfit">100</span>
            </span>
        </div>
        <hr class="item-divider">
        <div class="market-item-buy" id="farmButton">
            <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
            <span class="price-value" id="farmPrice">100</span>
        </div>
    `;
    marketItems.appendChild(farmElement);
    
    let currentFarmLevel = parseInt(localStorage.getItem('farmLevel')) || 0;
    
    function updateFarmButton() {
        const farmButton = document.getElementById('farmButton');
        const farmPrice = document.getElementById('farmPrice');
        const farmLevel = document.getElementById('farmLevel');
        const farmProfit = document.getElementById('farmProfit');

        if (currentFarmLevel >= farmData.length || localStorage.getItem('farmMaxLevel') === 'true') {
            farmLevel.textContent = farmData[farmData.length - 1].level;
            farmProfit.textContent = farmData[farmData.length - 1].profit;
            farmPrice.textContent = 'MAX';
            farmButton.disabled = true;
            farmButton.textContent = 'Максимальный уровень';
            localStorage.setItem('farmMaxLevel', 'true');
        } else {
            const nextLevel = farmData[currentFarmLevel];
            farmLevel.textContent = nextLevel.level;
            farmProfit.textContent = nextLevel.profit;
            farmPrice.textContent = nextLevel.price;
            farmButton.disabled = false;
        }
        
        localStorage.setItem('farmLevel', currentFarmLevel.toString());
    }
    
    document.getElementById('farmButton').addEventListener('click', function() {
        if (this.disabled) return;

        const nextLevel = farmData[currentFarmLevel];
        const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
        const currentHourlyProfit = parseInt(localStorage.getItem('hourlyProfit')) || 0;

        if (currentBalance >= nextLevel.price) {
            const newBalance = currentBalance - nextLevel.price;
            localStorage.setItem('balance', newBalance.toString());

            const newHourlyProfit = currentHourlyProfit + nextLevel.profit;
            localStorage.setItem('hourlyProfit', newHourlyProfit.toString());
            
            if (typeof updateHourlyProfit === 'function') {
                hourlyProfit = newHourlyProfit;
                updateHourlyProfit();
            }

            currentFarmLevel++;
            if (currentFarmLevel >= farmData.length) {
                currentFarmLevel = farmData.length - 1;
                localStorage.setItem('farmMaxLevel', 'true');
            }
            updateFarmButton();

            updateBalance();

            showPopup('Поздравляем!', `Вы успешно увеличили прибыль в час на +${nextLevel.profit}!`);
        } else {
            showPopup('Ой!', 'Недостаточно средств для покупки!');
        }
    });

    if (localStorage.getItem('farmMaxLevel') === 'true') {
        currentFarmLevel = farmData.length - 1;
    }
    updateFarmButton();


    const hourData1 = [
        { level: 1, profit: 100, price: 150 },
        { level: 2, profit: 200, price: 250 },
        { level: 3, profit: 300, price: 450 },
        { level: 4, profit: 400, price: 850 },
        { level: 5, profit: 500, price: 1650 },
        { level: 6, profit: 600, price: 3250 },
        { level: 7, profit: 700, price: 6700 },
        { level: 8, profit: 800, price: 13800 },
        { level: 9, profit: 900, price: 27600 },
        { level: 10, profit: 1000, price: 54200 },
    ];
    
    const hourData2 = [
        { level: 1, profit: 1000, price: 57000 },
        { level: 2, profit: 2000, price: 125000 },
        { level: 3, profit: 3000, price: 250000 },
        { level: 4, profit: 4000, price: 534000 },
        { level: 5, profit: 5000, price: 1100000 },
        { level: 6, profit: 6000, price: 2200000 },
        { level: 7, profit: 7000, price: 3600000 },
        { level: 8, profit: 8000, price: 7000000 },
        { level: 9, profit: 9000, price: 9000000 },
        { level: 10, profit: 10000, price: 18000000 },
    ];
    
    const hourData3 = [
        { level: 1, profit: 300, price: 550 },
        { level: 2, profit: 600, price: 3500 },
        { level: 3, profit: 800, price: 14000 },
        { level: 4, profit: 900, price: 30000 },
        { level: 5, profit: 1000, price: 60000 },
        { level: 6, profit: 1200, price: 75000 },
        { level: 7, profit: 1700, price: 100000 },
        { level: 8, profit: 2300, price: 140000 },
        { level: 9, profit: 2800, price: 206000 },
        { level: 10, profit: 3500, price: 275000 },
    ];
    
    const hourData4 = [
        { level: 1, profit: 50, price: 50 },
        { level: 2, profit: 70, price: 70 },
        { level: 3, profit: 80, price: 80 },
        { level: 4, profit: 90, price: 90 },
        { level: 5, profit: 100, price: 100 },
        { level: 6, profit: 110, price: 110 },
        { level: 7, profit: 140, price: 140 },
        { level: 8, profit: 160, price: 160 },
        { level: 9, profit: 210, price: 210 },
        { level: 10, profit: 250, price: 250 },
    ];
    
    // Создание кнопок для улучшения в час
    function createHourButton(data, title, index) {
        const hourElement = document.createElement('div');
        hourElement.className = 'market-item';
        hourElement.innerHTML = `
            <div class="market-item-header">
                <span class="market-item-level">Ур. <span id="hourLevel${index}">1</span></span>
                <span class="market-item-title">${title}</span>
                <span class="market-item-profit">
                    Прибыль в час <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="hourProfit${index}">100</span>
                </span>
            </div>
            <hr class="item-divider">
            <div class="market-item-buy" id="hourButton${index}">
                <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
                <span class="price-value" id="hourPrice${index}">150</span>
            </div>
        `;
        marketItems.appendChild(hourElement);
    
        let currentHourLevel = parseInt(localStorage.getItem(`hourLevel${index}`)) || 0;
    
        function updateHourButton() {
            const hourButton = document.getElementById(`hourButton${index}`);
            const hourPrice = document.getElementById(`hourPrice${index}`);
            const hourLevel = document.getElementById(`hourLevel${index}`);
            const hourProfit = document.getElementById(`hourProfit${index}`);
    
            if (currentHourLevel >= data.length || localStorage.getItem(`hourMaxLevel${index}`) === 'true') {
                hourLevel.textContent = data[data.length - 1].level;
                hourProfit.textContent = data[data.length - 1].profit;
                hourPrice.textContent = 'MAX';
                hourButton.disabled = true;
                hourButton.textContent = 'Максимальный уровень';
                localStorage.setItem(`hourMaxLevel${index}`, 'true');
            } else {
                const nextLevel = data[currentHourLevel];
                hourLevel.textContent = nextLevel.level;
                hourProfit.textContent = nextLevel.profit;
                hourPrice.textContent = nextLevel.price;
                hourButton.disabled = false;
            }
    
            localStorage.setItem(`hourLevel${index}`, currentHourLevel.toString());
        }
    
        document.getElementById(`hourButton${index}`).addEventListener('click', function() {
            if (this.disabled) return;
    
            const nextLevel = data[currentHourLevel];
            const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
            const currentHourlyProfit = parseInt(localStorage.getItem('hourlyProfit')) || 0;
    
            if (currentBalance >= nextLevel.price) {
                const newBalance = currentBalance - nextLevel.price;
                localStorage.setItem('balance', newBalance.toString());
    
                const newHourlyProfit = currentHourlyProfit + nextLevel.profit;
                localStorage.setItem('hourlyProfit', newHourlyProfit.toString());
    
                if (typeof updateHourlyProfit === 'function') {
                    hourlyProfit = newHourlyProfit;
                    updateHourlyProfit();
                }
    
                currentHourLevel++;
                if (currentHourLevel >= data.length) {
                    currentHourLevel = data.length - 1;
                    localStorage.setItem(`hourMaxLevel${index}`, 'true');
                }
                updateHourButton();
    
                updateBalance();
    
                showPopup('Поздравляем!', `Вы успешно увеличили прибыль в час на +${nextLevel.profit}!`);
            } else {
                showPopup('Ой!', 'Недостаточно средств для покупки!');
            }
        });
    
        if (localStorage.getItem(`hourMaxLevel${index}`) === 'true') {
            currentHourLevel = data.length - 1;
        }
        updateHourButton();
    }
    
    // Создаем кнопки для всех четырех категорий
    createHourButton(hourData1, 'Заехать в кофеманию', 1);
    createHourButton(hourData2, 'Подписать нового бойца', 2);
    createHourButton(hourData3, 'Выиграть в футбол медиалиге', 3);
    createHourButton(hourData4, 'Выиграть гонку', 4);














    // ... существующий код ...

const energyData = [
    { level: 1, profit: 100, price: 100 },
    { level: 2, profit: 200, price: 200 },
    { level: 3, profit: 300, price: 400 },
    { level: 4, profit: 400, price: 800 },
    { level: 5, profit: 500, price: 1600 },
    { level: 6, profit: 600, price: 3200 },
    { level: 7, profit: 700, price: 6400 },
    { level: 8, profit: 800, price: 12800 },
    { level: 9, profit: 900, price: 25600 },
    { level: 10, profit: 1000, price: 51200 },
];

const energyElement = document.createElement('div');
energyElement.className = 'market-item';
energyElement.innerHTML = `
    <div class="market-item-header">
        <span class="market-item-level">Ур. <span id="energyLevel">1</span></span>
        <span class="market-item-title">Заряд энергии</span>
        <span class="market-item-profit">
            Добавить энергии <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+<span id="energyProfit">100</span>
        </span>
    </div>
    <hr class="item-divider">
    <div class="market-item-buy" id="energyButton">
        <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
        <span class="price-value" id="energyPrice">100</span>
    </div>
`;
marketItems.appendChild(energyElement);

let currentEnergyLevel = parseInt(localStorage.getItem('energyLevel')) || 0;

function updateEnergyButton() {
    const energyButton = document.getElementById('energyButton');
    const energyPrice = document.getElementById('energyPrice');
    const energyLevel = document.getElementById('energyLevel');
    const energyProfit = document.getElementById('energyProfit');

    if (currentEnergyLevel >= energyData.length || localStorage.getItem('energyMaxLevel') === 'true') {
        energyLevel.textContent = energyData[energyData.length - 1].level;
        energyProfit.textContent = energyData[energyData.length - 1].profit;
        energyPrice.textContent = 'MAX';
        energyButton.disabled = true;
        energyButton.textContent = 'Максимальный уровень';
        localStorage.setItem('energyMaxLevel', 'true');
    } else {
        const nextLevel = energyData[currentEnergyLevel];
        energyLevel.textContent = nextLevel.level;
        energyProfit.textContent = nextLevel.profit;
        energyPrice.textContent = nextLevel.price;
        energyButton.disabled = false;
    }
    
    localStorage.setItem('energyLevel', currentEnergyLevel.toString());
}

document.getElementById('energyButton').addEventListener('click', function() {
    if (this.disabled) return;

    const nextLevel = energyData[currentEnergyLevel];
    const currentBalance = parseInt(localStorage.getItem('balance')) || 0;

    if (currentBalance >= nextLevel.price) {
        const newBalance = currentBalance - nextLevel.price;
        localStorage.setItem('balance', newBalance.toString());

        const currentMaxEnergy = parseInt(localStorage.getItem('maxEnergy')) || 100;
        const newMaxEnergy = currentMaxEnergy + nextLevel.profit;
        localStorage.setItem('maxEnergy', newMaxEnergy.toString());

        // Отправляем сообщение главной странице для обновления максимальной энергии
        window.parent.postMessage({ type: 'updateMaxEnergy', newMaxEnergy: newMaxEnergy }, '*');

        currentEnergyLevel++;
        if (currentEnergyLevel >= energyData.length) {
            currentEnergyLevel = energyData.length - 1;
            localStorage.setItem('energyMaxLevel', 'true');
        }
        updateEnergyButton();

        updateBalance();

        showPopup('Поздравляем!', `Вы успешно увеличили максимальную энергию на +${nextLevel.profit}!`);
    } else {
        showPopup('Ой!', 'Недостаточно средств для покупки!');
    }
});

if (localStorage.getItem('energyMaxLevel') === 'true') {
    currentEnergyLevel = energyData.length - 1;
}
updateEnergyButton();

// ... остальной код ...







    // Обновленные данные маркета с уникальными идентификаторами
    const marketData = [
        
        
        { id: 3, title: 'Title', level: 1, profitType: 'hourly', profit: 4, price: 11, timer: '16:30:00' },
       
    ];
    
 

    
    // Обновляем обработчик событий
    marketItems.addEventListener('click', function(event) {
        const buyButton = event.target.closest('.market-item-buy');
        if (buyButton) {
            const itemId = parseInt(buyButton.dataset.id);
            const item = marketData.find(item => item.id === itemId);
            if (item) {
                buyItem(item);
            }
        }
    });

    function buyItem(item) {
        const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
        const currentHourlyProfit = parseInt(localStorage.getItem('hourlyProfit')) || 0;
        const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;

        if (currentBalance >= item.price) {
            // Вычитаем цену из баланса
            const newBalance = currentBalance - item.price;
            localStorage.setItem('balance', newBalance.toString());

            // Увеличиваем соответствующую прибыль или энергию
            if (item.profitType === 'hourly') {
                const newHourlyProfit = currentHourlyProfit + item.profit;
                localStorage.setItem('hourlyProfit', newHourlyProfit.toString());
                
                // Обновляем отображение на главной странице, если она открыта
                if (typeof updateHourlyProfit === 'function') {
                    hourlyProfit = newHourlyProfit;
                    updateHourlyProfit();
                }
            } else if (item.profitType === 'tap') {
                const newTapProfit = currentTapProfit + item.profit;
                localStorage.setItem('tapProfit', newTapProfit.toString());
                
                // Обновляем отображение на главной странице, если она открыта
                if (typeof updateTapProfit === 'function') {
                    tapProfit = newTapProfit;
                    updateTapProfit(); // Обновляем tapProfit
                }
            } else if (item.profitType === 'energy') {
                // тправляем сообщение главной странице для обновления максимальной энергии
                window.parent.postMessage({ type: 'updateMaxEnergy', increase: item.profit }, '*');
            }

            // Обновляем отображение на странице коллекции
            updateCollectionDisplay();

            // Обновляем отображение баланса
            updateBalance();

            showPopup('Поздравляем!', `Вы успешно купили "${item.title}"!`);
        } else {
            showPopup('Ой!', 'Недостаточно средств для покупки!');
        }
    }

    function updateCollectionDisplay() {
        // Здесь можо обновить отображение коллекции, если необходимо
        // Например, разблокировать купленный предмет в сетке коллекции
    }

    function updateProfitDisplay() {
        const tapProfitElement = document.getElementById('tapProfit');
        const hourlyProfitElement = document.getElementById('hourlyProfit');
        
        if (tapProfitElement) {
            tapProfitElement.textContent = localStorage.getItem('tapProfit') || '1';
        }
        
        if (hourlyProfitElement) {
            hourlyProfitElement.textContent = localStorage.getItem('hourlyProfit') || '0';
        }
    }

    function updateBalance() {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = localStorage.getItem('balance') || '0';
        }
    }

    // Вызываем эту функцию при загрузке страницы коллекции
    updateProfitDisplay();
    
    function updateUnlockedCans() {
        const currentLevel = parseInt(localStorage.getItem('currentLevel')) || 1;
        const items = collectionGrid.querySelectorAll('.collection-item');
        items.forEach((item, index) => {
            if (index < currentLevel) {
                item.classList.add('unlocked');
            } else {
                item.classList.remove('unlocked');
            }
        });
    }
    
    function updateCanImage(index) {
        const canElement = document.getElementById('can');
        const canTypeElement = document.getElementById('canType');
        if (canElement && canTypeElement) {
            canElement.src = canImages[index];
            
            // Обновляем текст типа банки
            if (index === 0) {
                canTypeElement.textContent = 'Classic';
            } else if (index === 1) {
                canTypeElement.textContent = 'Mango Coconut';
            } else if (index === 2) {
                canTypeElement.textContent = 'Blueberry';
            }
            
            // Обновляем изображение в превью коллекции
            const canPreviewElement = document.querySelector('.can-preview img');
            if (canPreviewElement) {
                canPreviewElement.src = canImages[index];
            }
            
            // Обновляем тему приложения
            updateAppTheme(canImages[index]);
            
            // Сохраняем выбранную банку в localStorage
            localStorage.setItem('selectedCan', index.toString());
        }
    }

    function changeCan(index) {
        if (index >= 0 && index < canImages.length) {
            updateCanImage(index);
            showPopup('Да вы в кондициях!', 'Банка успешно изменена!');
        }
    }

    // Обновляем обработчик клика на элементы коллекции
    collectionGrid.addEventListener('click', function(event) {
        const item = event.target.closest('.collection-item');
        if (item && item.classList.contains('unlocked')) {
            const index = parseInt(item.dataset.index);
            changeCan(index);
        }
    });

    // При загрузке страницы, обновляем изображение банки
    document.addEventListener('DOMContentLoaded', function() {
        const selectedCan = parseInt(localStorage.getItem('selectedCan')) || 0;
        updateCanImage(selectedCan);
    });

    // Обновляем отображение при изменении уровня
    window.addEventListener('message', function(event) {
        if (event.data.type === 'levelUp') {
            updateUnlockedCans();
        }
    });

    // Добавьте эту функцию в конец файла
    function adjustPageHeight() {
        const footerHeight = document.querySelector('.footer').offsetHeight;
        document.getElementById('collection-page').style.height = `calc(100% - ${footerHeight}px)`;
    }

    // Вызовите функцию при загрузке страницы и при изменении размера окна
    window.addEventListener('load', adjustPageHeight);
    window.addEventListener('resize', adjustPageHeight);
// Добавляем вкладки категорий
const categoryTabs = document.createElement('div');
categoryTabs.className = 'category-tabs';
categoryTabs.innerHTML = `
    <button class="category-tab active" data-category="tap">ТАП</button>
    <button class="category-tab" data-category="hour">ЧАС</button>
    <button class="category-tab" data-category="energy">ЭНЕРГИЯ</button>
    <button class="category-tab" data-category="premium">⭐ PREMIUM</button>
`;
marketItems.insertBefore(categoryTabs, marketItems.firstChild);

// Создаем контейнеры для каждой категории улучшений
const tapUpgrades = document.createElement('div');
tapUpgrades.className = 'upgrade-category active';
tapUpgrades.id = 'tap-upgrades';

const hourUpgrades = document.createElement('div');
hourUpgrades.className = 'upgrade-category';
hourUpgrades.id = 'hour-upgrades';

const energyUpgrades = document.createElement('div');
energyUpgrades.className = 'upgrade-category';
energyUpgrades.id = 'energy-upgrades';

const premiumUpgrades = document.createElement('div');
premiumUpgrades.className = 'upgrade-category';
premiumUpgrades.id = 'premium-upgrades';

// Перемещаем существующие улучшения в соответствующие категории
const existingUpgrades = marketItems.querySelectorAll('.market-item');
existingUpgrades.forEach(upgrade => {
    // Проверяем, не является ли элемент премиум-улучшением
    if (!upgrade.classList.contains('premium-item')) {
        const profitText = upgrade.querySelector('.market-item-profit').textContent.toLowerCase();
        if (profitText.includes('тап')) {
            tapUpgrades.appendChild(upgrade);
        } else if (profitText.includes('час')) {
            hourUpgrades.appendChild(upgrade);
        } else if (profitText.includes('энергии')) {
            energyUpgrades.appendChild(upgrade);
        }
    }
});

// Добавляем премиум-улучшения отдельно
defaultUpgrades
    .filter(upgrade => upgrade.isPremium)
    .forEach(upgrade => {
        premiumUpgrades.appendChild(createPremiumUpgrade(upgrade));
    });

// Добавляем все категории в маркет
marketItems.appendChild(tapUpgrades);
marketItems.appendChild(hourUpgrades);
marketItems.appendChild(energyUpgrades);
marketItems.appendChild(premiumUpgrades);

// Обработчик переключения вкладк
categoryTabs.addEventListener('click', function(event) {
    if (event.target.classList.contains('category-tab')) {
        const category = event.target.dataset.category;
        
        // Обновляем активную вкладку
        categoryTabs.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        // Показываем соответствующую группу улучшений
        document.querySelectorAll('.upgrade-category').forEach(group => {
            group.classList.remove('active');
            group.style.display = 'none';
        });
        const targetGroup = document.getElementById(`${category}-upgrades`);
        if (targetGroup) {
            targetGroup.classList.add('active');
            targetGroup.style.display = 'block';
        }
    }
});

})();
// Функция для создания премиум-улучшения
function createPremiumUpgrade(upgrade) {
    const element = document.createElement('div');
    element.className = 'market-item premium-item';
    element.innerHTML = `
        <div class="market-item-header">
            <span class="market-item-emoji">${upgrade.emoji}</span>
            <span class="market-item-title">${upgrade.title}</span>
            <span class="market-item-profit">
                Множитель тапа x${upgrade.multiplier} на 24 часа
            </span>
        </div>
        <hr class="item-divider">
        <div class="market-item-buy premium-buy" id="premium${upgrade.id}">
            <span class="premium-stars">${upgrade.stars} ⭐</span>
        </div>
    `;

    element.querySelector('.premium-buy').addEventListener('click', () => {
        purchaseStarBoost(upgrade);
    });

    return element;
}

// Функция покупки буста за звезды
async function purchaseStarBoost(upgrade) {
    try {
        const result = await window.Telegram.WebApp.showPopup({
            title: 'Подтверждение покупки',
            message: `Купить ${upgrade.title} за ${upgrade.stars} ⭐?`,
            buttons: [
                {text: 'Купить', type: 'ok'},
                {text: 'Отмена', type: 'cancel'}
            ]
        });

        if (result === 'ok') {
            // Сохраняем информацию о бусте перед открытием Fragment
            localStorage.setItem('pendingBoost', JSON.stringify({
                multiplier: upgrade.multiplier,
                title: upgrade.title,
                timestamp: Date.now()
            }));

            // Открываем окно оплаты Fragment
            const invoiceUrl = `https://t.me/fragment?stars=${upgrade.stars}&comment=${encodeURIComponent(upgrade.title)}`;
            window.Telegram.WebApp.openLink(invoiceUrl);
        }
    } catch (error) {
        console.error('Ошибка при покупке буста:', error);
        window.Telegram.WebApp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось совершить покупку'
        });
    }
}

// Проверяем статус покупки при возврате в приложение
window.addEventListener('focus', async () => {
    const pendingBoost = localStorage.getItem('pendingBoost');
    if (pendingBoost) {
        const { multiplier, title } = JSON.parse(pendingBoost);
        
        try {
            const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
            const boostResponse = await fetch(`/activate-boost?telegramId=${telegramId}&multiplier=${multiplier}&duration=${24 * 60 * 60 * 1000}`);
            const boostData = await boostResponse.json();

            if (boostData.success) {
                // Показываем уведомление об успешной покупке
                window.Telegram.WebApp.showPopup({
                    title: '✨ Успех!',
                    message: `${title} успешно активирован!\nМножитель x${multiplier} действует 24 часа.`
                });

                // Обновляем статус буста на странице
                updateBoostStatus();
                
                // Отправляем сообщение родительскому окну для обновления множителя
                window.parent.postMessage({ 
                    type: 'updateBoostMultiplier', 
                    multiplier: multiplier 
                }, '*');
            }
        } catch (error) {
            console.error('Ошибка при активации буста:', error);
            window.Telegram.WebApp.showPopup({
                title: 'Ошибка',
                message: 'Не удалось активировать буст'
            });
        }

        // Удаляем информацию о незавершенной покупке
        localStorage.removeItem('pendingBoost');
    }
});

// Добавляем стили
const premiumStyles = `
    .premium-item {
        background: linear-gradient(45deg, rgba(255,215,0,0.1), transparent);
        border: 1px solid #ffd700;
    }

    .premium-buy {
        background: linear-gradient(45deg, #ffd700, #ffa500);
        cursor: pointer;
        transition: all 0.2s;
    }

    .premium-buy:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .premium-stars {
        font-size: 1.2em;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .boost-timer {
        font-size: 0.9em;
        color: #ffd700;
        margin-top: 4px;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = premiumStyles;
document.head.appendChild(styleSheet);

// Функция проверки бустов при загрузке страницы
async function checkBoosts() {
    try {
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
        const response = await fetch(`/verify-premium?telegramId=${telegramId}`);
        const data = await response.json();
        
        if (data.activeBoosts && data.activeBoosts.length > 0) {
            const maxBoost = Math.max(...data.activeBoosts.map(b => b.multiplier));
            
            // Обновляем множитель в игре
            window.parent.postMessage({ 
                type: 'updateBoostMultiplier', 
                multiplier: maxBoost 
            }, '*');

            // Обновляем таймеры локально
            startLocalBoostTimer(data.activeBoosts);
        }
    } catch (error) {
        console.error('Ошибка при проверке бустов:', error);
    }
}

// Функция для локального отсчета времени буста
function startLocalBoostTimer(boosts) {
    const timerContainer = document.querySelector('.premium-item');
    if (!timerContainer) return;

    // Очищаем предыдущие таймеры
    const oldTimers = timerContainer.querySelectorAll('.boost-timer');
    oldTimers.forEach(timer => timer.remove());

    // Создаем новый таймер
    const timerElement = document.createElement('div');
    timerElement.className = 'boost-timer';
    timerContainer.appendChild(timerElement);

    // Функция обновления таймера
    function updateTimer() {
        const currentTime = Date.now();
        const activeBoosts = boosts.filter(boost => 
            (boost.startTime + boost.duration) > currentTime
        );

        if (activeBoosts.length === 0) {
            timerElement.remove();
            // Сбрасываем множитель
            window.parent.postMessage({ 
                type: 'updateBoostMultiplier', 
                multiplier: 1 
            }, '*');
            return;
        }

        const maxBoost = Math.max(...activeBoosts.map(b => b.multiplier));
        const longestBoost = activeBoosts.reduce((a, b) => 
            (a.startTime + a.duration) > (b.startTime + b.duration) ? a : b
        );

        const timeLeft = (longestBoost.startTime + longestBoost.duration) - currentTime;
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        
        timerElement.textContent = `Буст x${maxBoost} активен еще ${hours}ч ${minutes}м`;
    }

    // Обновляем каждую минуту локально
    updateTimer();
    const timerId = setInterval(updateTimer, 60 * 1000);

    // Очищаем интервал при уничтожении компонента
    window.addEventListener('unload', () => clearInterval(timerId));
}

// Проверяем бусты только при загрузке страницы
document.addEventListener('DOMContentLoaded', checkBoosts);