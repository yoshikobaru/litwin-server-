console.log('friends.js загружен');

const canImages = [
    'assets/two.png',
    'assets/twobankamango.png',
    'assets/twobankablueberry.png',
    // Добавьте остальные изображения для двух банок здесь
];

window.addEventListener('message', function(event) {
    console.log('Получено сообщение:', event.data);
    if (event.data.type === 'updateTheme') {
        applyTheme(event.data.theme);
    }
    if (event.data.type === 'updateCan') {
        const selectedCan = event.data.canSrc;
        updateCansImage(selectedCan);
    }
});

function applyTheme(theme) {
    console.log('Применение темы:', theme);
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--tertiary-color', theme.tertiary);
}

function updateCansImage(index) {
    console.log('Обновление изображения банок:', index);
    const cansImage = document.getElementById('cansImage');
    if (!cansImage) {
        console.error('Элемент cansImage не найден');
        return;
    }
    const newCanSrc = canImages[index];
    if (newCanSrc) {
        cansImage.src = newCanSrc;
        console.log('Новый src изображения:', cansImage.src);
    } else {
        console.error('Неверный индекс банки:', index);
    }
}

function handleInviteButtonClick(event) {
    console.log('Кнопка "Пригласить друга" нажата');
    event.preventDefault();
    
    if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('Telegram WebApp не доступен');
        alert('Ошибка: Telegram WebApp не доступен');
        return;
    }
    
    console.log('Telegram WebApp доступен');
    
    const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
    console.log('Telegram ID:', telegramId);

    fetch(`https://litwin-tap.ru/get-referral-link?telegramId=${telegramId}`)
    .then(response => {
        console.log('Ответ получен:', response);
        return response.json();
    })
    .then(data => {
        console.log('Данные получены:', data);
        if (data.inviteLink) {
            console.log('Реферальная ссылка получена:', data.inviteLink);
            
            // Копируем ссылку в буфер обмена
            navigator.clipboard.writeText(data.inviteLink).then(() => {
                console.log('Ссылка скопирована в буфер обмена');
                
                // Показываем всплывающее уведомление
                window.Telegram.WebApp.showPopup({
                    title: 'Ссылка скопирована!',
                    message: 'Реферальная ссылка скопирована в буфер обмена. Отправьте её друзьям!',
                    buttons: [{text: 'OK', type: 'ok'}]
                });
            }).catch(err => {
                console.error('Не удалось скопировать ссылку:', err);
                alert('Не удалось скопировать ссылку. Пожалуйста, скопируйте её вручную: ' + data.inviteLink);
            });
        } else {
            console.error('Ссылка не получена:', data);
            alert('Не удалось получить реферальную ссылку. Попробуйте позже.');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка. Попробуйте позже.');
    });
}

function initializeFriendsPage() {
    console.log('Инициализация страницы друзей');
    const inviteButton = document.getElementById('inviteButton');
    if (inviteButton) {
        console.log('Кнопка найдена, добавляем обработчик');
        inviteButton.addEventListener('click', handleInviteButtonClick);
    } else {
        console.error('Кнопка приглашения не найдена');
    }

    const friendsList = document.getElementById('friendsList');
    if (!friendsList) {
        console.error('Элемент friendsList не найден');
        return;
    }

    // Пример данных о друзьях (в реальном приложении эти данные должны загружаться с сервера)
    const friends = [
        { name: '@evve_rigell', xp: '1 000 000 xp' },
        { name: '@evve_rigell', xp: '1 000 000 xp' },
        { name: '@evve_rigell', xp: '1 000 000 xp' },
        { name: '@evve_rigell', xp: '1 000 000 xp' }
    ];

    // Отображение списка друзей
    friends.forEach(friend => {
        const friendItem = document.createElement('div');
        friendItem.className = 'friend-item';
        friendItem.innerHTML = `
            <span class="friend-name">${friend.name}</span>
            <span class="friend-xp">${friend.xp}</span>
        `;
        friendsList.appendChild(friendItem);
    });

    console.log('Список друзей отображен');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    initializeFriendsPage();

    // Проверяем текущую выбранную банку при загрузке страницы
    const selectedCan = localStorage.getItem('selectedCan');
    if (selectedCan) {
        updateCansImage(parseInt(selectedCan));
    }
});

// Добавляем глобальный обработчик ошибок
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Глобальная ошибка:', message, 'Источник:', source, 'Строка:', lineno, 'Колонка:', colno, 'Объект ошибки:', error);
};