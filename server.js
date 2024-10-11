const https = require('https');  
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');
const crypto = require('crypto');
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const url = require('url');

// Создаем подключение к базе данных
const sequelize = new Sequelize('litwin_tap', 'litwin_user', 'Negxtic007', {
  host: 'localhost',
  dialect: 'postgres'
});

// Определяем модель User
const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  referredBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Синхронизируем модель с базой данных
sequelize.sync();
// Создаем экземпляр бота с вашим токеном
const bot = new Telegraf(process.env.BOT_TOKEN);
// WebApp URL
const webAppUrl = 'https://litwin-tap.ru';

// Обработчик команды /start
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const referralCode = ctx.message.text.split(' ')[1];

  try {
    let user = await User.findOne({ where: { telegramId } });

    if (!user) {
      // Генерируем уникальный реферальный код для нового пользователя
      const newReferralCode = crypto.randomBytes(4).toString('hex');
      
      user = await User.create({
        telegramId,
        referralCode: newReferralCode,
        referredBy: referralCode || null
      });

      if (referralCode) {
        const referrer = await User.findOne({ where: { referralCode } });
        if (referrer) {
          // Здесь можно добавить логику начисления бонусов рефереру
          console.log(`User ${telegramId} was referred by ${referrer.telegramId}`);
        }
      }
    }

    ctx.reply('Привет! Я бот для игры "LIT⚡️WIN Tap". Нажми на кнопку ниже, чтобы начать игру:', {
      reply_markup: {
        keyboard: [
          [{ text: 'Играть!', web_app: { url: webAppUrl } }]
        ],
        resize_keyboard: true
      }
    });

  } catch (error) {
    console.error('Error in start command:', error);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Запускаем бота
bot.launch();

// Определяем маршруты
const routes = {
  GET: {
    '/get-referral-link': async (req, res, query) => {
      console.log('Получен запрос на /get-referral-link'); // Отладочное сообщение
      const telegramId = query.telegramId;
      
      if (!telegramId) {
        console.log('Отсутствует telegramId'); // Отладочное сообщение
        return { status: 400, body: { error: 'Missing telegramId parameter' } };
      }

      try {
        console.log('Поиск пользователя с telegramId:', telegramId); // Отладочное сообщение
        const user = await User.findOne({ where: { telegramId } });
        if (user) {
          const inviteLink = `https://t.me/LITWIN_TAP_BOT?start=${user.referralCode}`;
          console.log('Сгенерирована ссылка:', inviteLink); // Отладочное сообщение
          return { status: 200, body: { inviteLink } };
        } else {
          console.log('Пользователь не найден'); // Отладочное сообщение
          return { status: 404, body: { error: 'User not found' } };
        }
      } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    }
  },
  '/get-referred-friends': async (req, res, query) => {
    console.log('Получен запрос на /get-referred-friends');
    const telegramId = query.telegramId;
    
    if (!telegramId) {
      console.log('Отсутствует telegramId');
      return { status: 400, body: { error: 'Missing telegramId parameter' } };
    }

    try {
      console.log('Поиск рефералов для пользователя с telegramId:', telegramId);
      const user = await User.findOne({ where: { telegramId } });
      if (user) {
        const referredFriends = await User.findAll({
          where: { referredBy: user.referralCode },
          attributes: ['telegramId']
        });
        console.log('Найдено рефералов:', referredFriends.length);
        return { status: 200, body: { referredFriends: referredFriends.map(friend => friend.telegramId) } };
      } else {
        console.log('Пользователь не найден');
        return { status: 404, body: { error: 'User not found' } };
      }
    } catch (error) {
      console.error('Ошибка при обработке запроса:', error);
      return { status: 500, body: { error: 'Internal server error' } };
    }
  },
  
  POST: {
    // Здесь вы можете добавить обработчики POST-запросов
  }
};

// Функция для обработки статических файлов
const serveStaticFile = (filePath, res) => {
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, '..', 'client', 'tutorial.html'), (error, content) => {
          if (error) {
            res.writeHead(404);
            res.end('Файл не найден');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Ошибка сервера: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/litwin-tap.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/litwin-tap.ru/fullchain.pem')
};

const server = https.createServer(options, async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Проверяем, есть ли обработчик для данного маршрута
  if (routes[method] && routes[method][pathname]) {
    const handler = routes[method][pathname];
    const result = await handler(req, res, parsedUrl.query);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
  } else {
    // Если нет обработчика, пытаемся отдать статический файл
    let filePath = path.join(__dirname, '..', 'litwin-server', req.url === '/' ? 'tutorial.html' : req.url);
    serveStaticFile(filePath, res);
  }
});

const port = 443;
server.listen(port, () => {
  console.log(`HTTPS Сервер запущен на порту ${port}`);
  console.log('Telegram бот запущен');
  console.log(`HTTPS Сервер запущен на https://litwin-tap.ru`);
});

// HTTP to HTTPS redirect
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));