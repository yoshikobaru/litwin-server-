window.Analytics = class {
    constructor() {
        this.initialized = false;
        this.queue = [];
        this.initAttempts = 0;
        this.maxAttempts = 5;
        this.init();
    }

    init() {
        if (this.initAttempts >= this.maxAttempts) {
            console.warn('Превышено максимальное количество попыток инициализации');
            return;
        }

        this.initAttempts++;

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            
            const initAttempt = () => {
                if (window.ym) {
                    try {
                        const user = window.Telegram.WebApp.initDataUnsafe.user;
                        if (user) {
                            // Отправляем базовые параметры пользователя
                            this._sendUserParams(user);
                        }
                        this.initialized = true;
                        console.log('Аналитика успешно инициализирована');
                        this.processQueue();
                    } catch (error) {
                        console.error('Ошибка при инициализации:', error);
                        if (this.initAttempts < this.maxAttempts) {
                            setTimeout(() => this.init(), 1000);
                        }
                    }
                } else {
                    setTimeout(initAttempt, 1000);
                }
            };

            initAttempt();
        }
    }

    _sendUserParams(user) {
        try {
            ym(98779515, 'params', {
                UserID: user.id,
                Username: user.username,
                TelegramClient: window.Telegram.WebApp.platform,
                AppVersion: window.Telegram.WebApp.version
            });
        } catch (error) {
            console.warn('Ошибка отправки параметров пользователя:', error);
        }
    }

    _sendEvent(eventName, parameters) {
        try {
            // Отправляем только достижение цели, без дополнительных параметров
            ym(98779515, 'reachGoal', eventName);
            
            // Отправляем параметры отдельно
            const eventData = {
                event_name: eventName,
                ...parameters,
                timestamp: new Date().toISOString()
            };

            if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
                eventData.telegram_user_id = window.Telegram.WebApp.initDataUnsafe.user.id;
            }

            ym(98779515, 'params', eventData);
            
            console.log('Событие отправлено:', eventName, parameters);
        } catch (error) {
            console.error('Ошибка при отправке события:', error);
        }
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.initialized) {
            this.queue.push({eventName, parameters});
            return;
        }

        this._sendEvent(eventName, parameters);
    }

    processQueue() {
        while (this.queue.length > 0) {
            const {eventName, parameters} = this.queue.shift();
            this._sendEvent(eventName, parameters);
        }
    }
}

// Создаем глобальный экземпляр
window.analytics = new window.Analytics();