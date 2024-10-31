// Создаем глобальный объект аналитики
window.Analytics = class {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            setTimeout(() => {
                if (window.ym) {
                    const user = window.Telegram.WebApp.initDataUnsafe.user;
                    if (user) {
                        ym(98779515, 'userParams', {
                            UserID: user.id,
                            Username: user.username,
                            TelegramClient: window.Telegram.WebApp.platform
                        });
                    }
                    this.initialized = true;
                }
            }, 1000);
        }
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.initialized) {
            console.warn('Аналитика не инициализирована');
            return;
        }

        try {
            if (window.ym) {
                ym(98779515, 'reachGoal', eventName);
                
                ym(98779515, 'params', {
                    event_name: eventName,
                    ...parameters,
                    telegram_user_id: getTelegramUserId(),
                    timestamp: new Date().toISOString()
                });
                
                console.log('Событие отправлено:', eventName, parameters);
            }
        } catch (error) {
            console.error('Ошибка при отправке события:', error);
        }
    }
}

// Создаем глобальный экземпляр
window.analytics = new window.Analytics();