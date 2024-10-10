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

document.addEventListener('DOMContentLoaded', () => {
    const inviteButton = document.getElementById('inviteButton');
    const friendsList = document.getElementById('friendsList');

    inviteButton.addEventListener('click', () => {
        // Здесь будет логика для генерации и копирования реферальной ссылки
        const referralLink = 'https://example.com/ref=123456'; // Замените на реальную ссылку
        navigator.clipboard.writeText(referralLink).then(() => {
            alert('Реферальная ссылка скопирована в буфер обмена!');
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
