const https = require('https');  
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Создаем экземпляр бота с вашим токеном
const bot = new Telegraf(process.env.BOT_TOKEN);
// WebApp URL
const webAppUrl = 'https://litwin-tap.ru';

// Обработчик команды /start
bot.command('start', (ctx) => {
    ctx.reply('Привет! Я бот для игры "LIT⚡️WIN Tap". Нажми на кнопку ниже, чтобы начать игру:', {
      reply_markup: {
        keyboard: [
          [{ text: 'Играть!', web_app: { url: webAppUrl } }]
        ],
        resize_keyboard: true
      }
    });
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