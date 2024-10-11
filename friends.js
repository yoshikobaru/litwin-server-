const canImages = [
    'assets/two.png',
    'assets/twobankamango.png',
    'assets/twobankablueberry.png',
    // Добавьте остальные изображения для двух банок здесь
];

window.addEventListener('message', function(event) {
    if (event.data.type === 'updateTheme') {
        applyTheme(event.data.theme);
    }
    if (event.data.type === 'updateCan') {
        const selectedCan = event.data.canSrc;
        updateCansImage(selectedCan);
    }
});

function applyTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--tertiary-color', theme.tertiary);
}

document.addEventListener('DOMContentLoaded', () => {
    const inviteButton = document.getElementById('inviteButton');
    const friendsList = document.getElementById('friendsList');
    const cansImage = document.getElementById('cansImage');

    // Функция для обновления изображения банок
    function updateCansImage(index) {
        console.log('Обновление изображения банок:', index); // Отладочное сообщение
        const newCanSrc = canImages[index];
        if (newCanSrc) {
            cansImage.src = newCanSrc;
            console.log('Новый src изображения:', cansImage.src); // Отладочное сообщение
        } else {
            console.error('Неверный индекс банки:', index);
        }
    }

    // Слушаем сообщения от родительского окна
    window.addEventListener('message', function(event) {
        console.log('Получено сообщение:', event.data); // Отладочное сообщение
        if (event.data.type === 'updateCan') {
            const canIndex = event.data.canIndex;
            updateCansImage(canIndex);
        }
    });

    // Проверяем текущую выбранную банку при загрузке страницы
    const selectedCan = localStorage.getItem('selectedCan');
    if (selectedCan) {
        updateCansImage(parseInt(selectedCan));
    }

    inviteButton.addEventListener('click', () => {
        console.log('Кнопка "Пригласить друга" нажата'); // Отладочное сообщение
        const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
        console.log('Telegram ID:', telegramId); // Отладочное сообщение

        // Запрашиваем реферальную ссылку с сервера
        fetch(`/get-referral-link?telegramId=${telegramId}`)
            .then(response => {
                console.log('Ответ получен:', response); // Отладочное сообщение
                return response.json();
            })
            .then(data => {
                console.log('Данные получены:', data); // Отладочное сообщение
                if (data.inviteLink) {
                    console.log('Отправка данных в Telegram:', data.inviteLink); // Отладочное сообщение
                    window.Telegram.WebApp.sendData(JSON.stringify({
                        action: 'share',
                        url: data.inviteLink
                    }));
                } else {
                    console.error('Ссылка не получена:', data); // Отладочное сообщение
                    alert('Не удалось получить реферальную ссылку. Попробуйте позже.');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка. Попробуйте позже.');
            });
    });
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
});
