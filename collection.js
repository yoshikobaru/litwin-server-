(function() {
    const collectionGrid = document.getElementById('collection-grid');
    const marketItems = document.getElementById('market-items');
    
    // Создаем сетку коллекции
    for (let i = 0; i < 8; i++) {
        const itemElement = document.createElement('div');
        itemElement.className = 'collection-item locked';
        itemElement.innerHTML = '<img src="assets/locked.png" alt="Замок" class="lock-icon">';
        collectionGrid.appendChild(itemElement);
    }
    
    // Обновленные данные маркета с уникальными идентификаторами
    const marketData = [
        { id: 1, title: 'Бахнуть литки', level: 1, profitType: 'tap', profit: 3, price: 10 },
        { id: 2, title: 'Title', level: 1, profitType: 'hourly', profit: 3, price: 10 },
        { id: 3, title: 'Title', level: 1, profitType: 'hourly', profit: 4, price: 11, timer: '16:30:00' },
        { id: 4, title: 'Title', level: 1, profitType: 'tap', profit: 5, price: 15 }
    ];
    
    marketData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'market-item';
        itemElement.innerHTML = `
            <div class="market-item-header">
                <span class="market-item-level">Ур. ${item.level}</span>
                <span class="market-item-title">${item.title}</span>
                <span class="market-item-profit">Прибыль ${item.profitType === 'tap' ? 'за тап' : 'в час'} <img src="assets/litcoin.png" alt="LIT" class="lit-coin-small">+${item.profit}</span>
            </div>
            <hr class="item-divider">
            <div class="market-item-price-container">
                <div class="price-circle" data-id="${item.id}">
                    <img src="assets/litcoin.png" alt="LIT" class="lit-coin">
                    <span class="price-value">${item.price}</span>
                </div>
            </div>
            ${item.timer ? `<div class="market-item-timer">${item.timer}</div>` : ''}
        `;
        marketItems.appendChild(itemElement);
    });

    // Обновляем обработчик событий для покупки
    marketItems.addEventListener('click', function(event) {
        const priceCircle = event.target.closest('.price-circle');
        if (priceCircle) {
            const itemId = parseInt(priceCircle.dataset.id);
            const item = marketData.find(i => i.id === itemId);
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

            // Увеличиваем соответствующую прибыль
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
})();
