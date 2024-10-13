function initializeFriendsPage() {
    console.log('Инициализация страницы друзей');
    const inviteButton = document.getElementById('inviteButton');
    const shareLinkButton = document.getElementById('shareLinkButton');
    
    if (inviteButton) {
        console.log('Кнопка приглашения найдена, добавляем обработчик');
        inviteButton.addEventListener('click', handleInviteButtonClick);
    } else {
        console.error('Кнопка приглашения не найдена');
    }
    
    if (shareLinkButton) {
        console.log('Кнопка поделиться найдена, добавляем обработчик');
        shareLinkButton.addEventListener('click', handleShareLinkButtonClick);
    } else {
        console.error('Кнопка поделиться не найдена');
    }

    // Получаем список приглашенных друзей
    getReferredFriends();

    // Проверяем текущую выбранную банку при загрузке страницы
    const selectedCan = localStorage.getItem('selectedCan');
    if (selectedCan) {
        updateCanImage(parseInt(selectedCan));
    }
}

function getReferredFriends() {
    let telegramId;
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
        } else {
            throw new Error('Telegram WebApp не инциализирован или не содержит данных пользователя');
        }
    } catch (error) {
        console.error('Ошибка при получении Telegram ID:', error);
        displayReferredFriends([]); // Отображаем пустой список друзей
        return;
    }

    fetch(`https://litwin-tap.ru/get-referred-friends?telegramId=${telegramId}`)
    .then(response => response.json())
    .then(data => {
        if (data.referredFriends) {
            displayReferredFriends(data.referredFriends);
        } else {
            console.error('Не удалось получить список рефералов:', data.error);
            displayReferredFriends([]);
        }
    })
    .catch(error => {
        console.error('Ошибка при получении списка рефералов:', error);
        displayReferredFriends([]);
    });
}

function displayReferredFriends(friends) {
    const friendsList = document.getElementById('friendsList');
    if (friendsList) {
        friendsList.innerHTML = '';
        if (friends.length === 0) {
            friendsList.innerHTML = '<p>У вас пока нет приглашенных друзей.</p>';
        } else {
            friends.forEach(friend => {
                const friendItem = document.createElement('div');
                friendItem.className = 'friend-item';
                
                const friendName = friend.username ? `@${friend.username}` : `User${friend.id}`;
                const rewardKey = `friend_reward_${friend.id}`;
                const isRewardClaimed = localStorage.getItem(rewardKey) === 'claimed';
                
                friendItem.innerHTML = `
                    <span class="friend-name">${friendName}</span>
                    <button class="friend-reward-button" onclick="claimFriendReward('${friend.id}')"
                            ${isRewardClaimed ? 'disabled' : ''}>
                        ${isRewardClaimed ? 'Награда получена' : 'Забрать награду'}
                    </button>
                `;
                friendsList.appendChild(friendItem);
            });
        }
    }
}

function claimFriendReward(friendId) {
    const rewardKey = `friend_reward_${friendId}`;
    if (localStorage.getItem(rewardKey) === 'claimed') {
        showPopup('Ошибка', 'Вы уже получили награду за этого друга.');
        return;
    }

    // Получаем текущую прибыль за тап
    const currentTapProfit = parseInt(localStorage.getItem('tapProfit')) || 1;
    
    // Устанавливаем новую прибыль (x2) на 30 секунд
    const newTapProfit = currentTapProfit * 2;
    window.updateTapProfit(newTapProfit);
    
    // Показываем сообщение пользователю
    showPopup('Награда получена!', 'Ваша прибыль за тап удвоена на 30 секунд!');
    
    // Отключаем кнопку
    const rewardButton = event.target;
    rewardButton.disabled = true;
    rewardButton.textContent = 'Награда получена';
    
    // Сохраняем информацию о полученной награде
    localStorage.setItem(rewardKey, 'claimed');
    
    // Возвращаем прибыль к исходному значению через 30 секунд
    setTimeout(() => {
        window.updateTapProfit(currentTapProfit);
        showPopup('Бонус закончился', 'Ваша прибыль за тап вернулась к обычному значению.');
    }, 30000);
}


    function showPopup(title, message) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'var(--tertiary-color)'; // Используем цвет из CSS переменных
        popup.style.color = '#fff'; // Белый текст для контраста
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        popup.style.zIndex = '1000';
        popup.style.maxWidth = '80%'; // Ограничиваем ширину попапа
        popup.style.textAlign = 'center'; // Центрируем текст
    
        const closeButton = document.createElement('button');
        closeButton.textContent = 'OK';
        closeButton.style.backgroundColor = 'var(--secondary-color)';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.padding = '10px 20px';
        closeButton.style.borderRadius = '5px';
        closeButton.style.marginTop = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => popup.remove();
    
        popup.innerHTML = `
            <h2 style="margin-top: 0; color: #FFD700;">${title}</h2>
            <p style="margin-bottom: 20px;">${message}</p>
        `;
        popup.appendChild(closeButton);
    
        document.body.appendChild(popup);
    }

    window.handleInviteButtonClick = function(event) {
        console.log('Функция handleInviteButtonClick вызвана');
        event.preventDefault();
        
        if (!window.Telegram || !window.Telegram.WebApp) {
            console.error('Telegram WebApp не доступен');
            showPopup('Ошибка', 'Telegram WebApp не доступен');
            return;
        }
        
        console.log('Telegram WebApp доступен');
        
        let telegramId;
        try {
            telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
            console.log('Telegram ID:', telegramId);
        } catch (error) {
            console.error('Не удалось получить Telegram ID:', error);
            showPopup('Ошибка', 'Не удалось получить информацию о пользователе');
            return;
        }
    
        if (!telegramId) {
            console.error('Telegram ID не определен');
            showPopup('Ошибка', 'Не удалось получить информацию о пользователе');
            return;
        }
    
        fetch(`https://litwin-tap.ru/get-referral-link?telegramId=${telegramId}`)
        .then(response => {
            console.log('Ответ получен:', response);
            return response.json();
        })
        .then(data => {
            console.log('Данные получены:', data);
            if (data.inviteLink) {
                console.log('Реферальная ссылка получена:', data.inviteLink);
                
                // Создаем временное текстовое поле для копирования
                const tempInput = document.createElement('input');
                tempInput.style.position = 'absolute';
                tempInput.style.left = '-9999px';
                tempInput.value = data.inviteLink;
                document.body.appendChild(tempInput);
                tempInput.select();
                tempInput.setSelectionRange(0, 99999); // Для мобильных устройств
    
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        console.log('Ссылка скопирована в буфер обмена');
                        showPopup('Успех', 'Реферальная ссылка скопирована в буфер обмена. Отправьте её друзьям!');
                    } else {
                        throw new Error('Копирование не удалось');
                    }
                } catch (err) {
                    console.error('Не удалось скопировать ссылку:', err);
                    showPopup('Внимание', `Не удалось скопировать ссылку. Пожалуйста, скопируйте её вручную: ${data.inviteLink}`);
                }
    
                document.body.removeChild(tempInput);
            } else {
                console.error('Ссылка не получена:', data);
                showPopup('Ошибка', 'Не удалось получить реферальную ссылку. Попробуйте позже.');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showPopup('Ошибка', 'Произошла ошибка при получении реферальной ссылки. Попробуйте позже.');
        });
    }
    function handleShareLinkButtonClick(event) {
        console.log('Функция handleShareLinkButtonClick вызвана');
        event.preventDefault();
        
        if (!window.Telegram || !window.Telegram.WebApp) {
            console.error('Telegram WebApp не доступен');
            showPopup('Ошибка', 'Telegram WebApp не доступен');
            return;
        }
        
        let telegramId;
        try {
            telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
            console.log('Telegram ID:', telegramId);
        } catch (error) {
            console.error('Не удалось получить Telegram ID:', error);
            showPopup('Ошибка', 'Не удалось получить информацию о пользователе');
            return;
        }
    
        if (!telegramId) {
            console.error('Telegram ID не определен');
            showPopup('Ошибка', 'Не удалось получить информацию о пользователе');
            return;
        }
    
        fetch(`https://litwin-tap.ru/get-referral-link?telegramId=${telegramId}`)
        .then(response => response.json())
        .then(data => {
            if (data.inviteLink) {
                const message = "Присоединяйся к LITWIN вместе со мной!";
                const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(message)}&url=${encodeURIComponent(data.inviteLink)}`;
                
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.openTelegramLink(shareUrl);
                } else {
                    window.open(shareUrl, "_blank");
                }
            } else {
                console.error('Ссылка не получена:', data);
                showPopup('Ошибка', 'Не удалось получить реферальную ссылку. Попробуйте позже.');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showPopup('Ошибка', 'Произошла ошибка при получении реферальной ссылки. Попробуйте позже.');
        });
    }
window.addEventListener('message', function(event) {
    console.log('��лучено сообщение:', event.data);
    if (event.data.type === 'updateCan') {
        const canSrc = event.data.canSrc;
        console.log('Получен новый источник изображения банки:', canSrc);
        const cansImage = document.getElementById('cansImage');
        if (cansImage) {
            console.log('Элемент cansImage найден');
            if (canSrc === 'assets/bankamango.png') {
                cansImage.src = 'assets/twobankamango.png';
            } else if (canSrc === 'assets/bankablueberry.png') {
                cansImage.src = 'assets/twobankablueberry.png';
            } else {
                cansImage.src = 'assets/twobanka.png';
            }
            console.log('Новое изображение установлено:', cansImage.src);
        } else {
            console.error('Элемент cansImage не найден');
        }
    }
});

// Добавьте эту функцию для проверки
function checkCansImage() {
    const cansImage = document.getElementById('cansImage');
    if (cansImage) {
        console.log('Элемент cansImage найден, текущий src:', cansImage.src);
    } else {
        console.error('Элемент cansImage не найден');
    }
}

// Вызовите эту функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', checkCansImage);

// Добавьте эту функцию в конец файла
document.addEventListener('DOMContentLoaded', initializeFriendsPage);
