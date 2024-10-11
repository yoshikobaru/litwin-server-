(function() {
    const collectionGrid = document.getElementById('collection-grid');
    const marketItems = document.getElementById('market-items');
    
    const canImages = [
        'assets/bankaClassic.png',
        'assets/bankamango.png',
        'assets/bankablueberry.png',
        'assets/banka4.png',
        'assets/banka5.png',
        'assets/banka6.png',
        'assets/banka7.png',
        'assets/banka8.png'
    ];
    
    // Создаем сетку коллекции
    for (let i = 0; i < 8; i++) {
        const itemElement = document.createElement('div');
        itemElement.className = 'collection-item';
        itemElement.dataset.index = i;
        itemElement.innerHTML = `<img src="${canImages[i]}" alt="Банка ${i + 1}" class="can-icon">`;
        collectionGrid.appendChild(itemElement);
    }
    
    // Обновляем отображение разблокированных банок
    updateUnlockedCans();
    
    // Добавляем обработчик клика на элементы коллекции
    collectionGrid.addEventListener('click', function(event) {
        const item = event.target.closest('.collection-item');
        if (item && item.classList.contains('unlocked')) {
            const index = parseInt(item.dataset.index);
            changeCan(index);
        }
    });
    
    // Обновленные данные маркета с уникальными идентификаторами
    const marketData = [
        { id: 1, title: 'Выпить LIT', level: 1, profitType: 'tap', profit: 3, price: 10 },
        { id: 2, title: 'Title', level: 1, profitType: 'hourly', profit: 3, price: 10 },
        { id: 3, title: 'Title', level: 1, profitType: 'hourly', profit: 4, price: 11, timer: '16:30:00' },
        { id: 4, title: 'Увеличить энергию', level: 1, profitType: 'energy', profit: 100, price: 15 }
    ];
    
    marketData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'market-item';
        itemElement.innerHTML = `
            <div class="market-item-header">
                <span class="market-item-level">Ур. ${item.level}</span>
                <span class="market-item-title">${item.title}</span>
                <span class="market-item-profit">
                    ${item.profitType === 'energy' 
                        ? `Добавить энергии <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+${item.profit}`
                        : `Прибыль ${item.profitType === 'tap' ? 'за тап' : 'в час'} <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+${item.profit}`
                    }
                </span>
            </div>
            <hr class="item-divider">
            <div class="market-item-buy" data-id="${item.id}">
                <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
                <span class="price-value">${item.price}</span>
            </div>
            ${item.timer ? `<div class="market-item-timer">${item.timer}</div>` : ''}
        `;
        marketItems.appendChild(itemElement);
    });

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
                    updateTapProfit();
                }
            } else if (item.profitType === 'energy') {
                // Отправляем сообщение главной странице для обновления максимальной энергии
                window.parent.postMessage({ type: 'updateMaxEnergy', increase: item.profit }, '*');
            }

            // Обновляем отображение на странице коллекции
            updateCollectionDisplay();

            // Обновляем отображение баланса
            updateBalance();

            alert(`Вы успешно купили "${item.title}"!`);
        } else {
            alert('Недостаточно средств для покупки!');
        }
    }

    function updateCollectionDisplay() {
        // Здесь можно обновить отображение коллекции, если необходимо
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
    
    function changeCan(index) {
        localStorage.setItem('selectedCan', index);
        window.parent.postMessage({ type: 'updateCan', canIndex: index }, '*');
        alert(`Выбрана банка ${index + 1}`);
    }
    
    // Обновляем отображение при изменении уровня
    window.addEventListener('message', function(event) {
        if (event.data.type === 'levelUp') {
            updateUnlockedCans();
        }
    });
})();
