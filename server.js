const https = require('https');  
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');
const crypto = require('crypto');
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
// Создаем подключение к базе данных
const sequelize = new Sequelize('litwin_tap', 'litwin_user', 'your_password', {
  host: 'localhost',
  dialect: 'postgres'
});

// Определяем модель Friend
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

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/litwin-tap.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/litwin-tap.ru/fullchain.pem')
};
const server = https.createServer(options, (req, res) => {
  let filePath = path.join(__dirname, '..', 'litwin-server', req.url === '/' ? 'tutorial.html' : req.url);
  
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
});

const port = 443; // Изменено на 443 для HTTPS
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

app.get('/get-referral-link', async (req, res) => {
  const telegramId = req.query.telegramId; // Предполагается, что telegramId передается в запросе
  try {
    const user = await User.findOne({ where: { telegramId } });
    if (user) {
      const inviteLink = `https://t.me/LITWIN_TAP_BOT?start=${user.referralCode}`;
      res.json({ inviteLink });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in get-referral-link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
server.on('request', async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/get-referral-link')) {
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const telegramId = urlParams.searchParams.get('telegramId');

    if (!telegramId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing telegramId parameter' }));
      return;
    }

    try {
      const user = await User.findOne({ where: { telegramId } });
      if (user) {
        const inviteLink = `https://t.me/LITWIN_TAP_BOT?start=${user.referralCode}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ inviteLink }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
      }
    } catch (error) {
      console.error('Error in get-referral-link:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});
