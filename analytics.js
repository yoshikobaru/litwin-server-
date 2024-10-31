window.Analytics = class {
    constructor() {
        this.initialized = false;
        this.queue = []; // Очередь для отложенных событий
        this.init();
    }

    init() {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            
            // Пытаемся инициализировать несколько раз
            const initAttempt = () => {
                if (window.ym) {
                    try {
                        const user = window.Telegram.WebApp.initDataUnsafe.user;
                        if (user) {
                            ym(98779515, 'userParams', {
                                UserID: user.id,
                                Username: user.username,
                                TelegramClient: window.Telegram.WebApp.platform
                            });
                        }
                        this.initialized = true;
                        console.log('Аналитика успешно инициализирована');
                        
                        // Отправляем накопленные события
                        this.processQueue();
                    } catch (error) {
                        console.error('Ошибка при инициализации:', error);
                    }
                } else {
                    setTimeout(initAttempt, 1000);
                }
            };

            initAttempt();
        }
    }

    processQueue() {
        while (this.queue.length > 0) {
            const {eventName, parameters} = this.queue.shift();
            this._sendEvent(eventName, parameters);
        }
    }

    _sendEvent(eventName, parameters) {
        try {
            if (window.ym) {
                ym(98779515, 'reachGoal', eventName);
                
                ym(98779515, 'params', {
                    event_name: eventName,
                    ...parameters,
                    telegram_user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
                    timestamp: new Date().toISOString()
                });
                
                console.log('Событие отправлено:', eventName, parameters);
            }
        } catch (error) {
            console.error('Ошибка при отправке события:', error);
        }
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.initialized) {
            console.log('Аналитика не инициализирована, добавляем событие в очередь:', eventName);
            this.queue.push({eventName, parameters});
            return;
        }

        this._sendEvent(eventName, parameters);
    }
}

// Создаем глобальный экземпляр
window.analytics = new window.Analytics();