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
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  referredBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tapProfit: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  hourlyProfit: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalEarnedCoins: {
    type: DataTypes.DECIMAL(30, 0),
    defaultValue: 0
  },
  adWatchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAdUniqueId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastAdWatchTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activeBoosts: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  }
});

// Синхронизируем модель с базой данных
sequelize.sync({ alter: true });
// Создаем экземпляр бота с вашим токеном
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.on('pre_checkout_query', async (ctx) => {
  try {
      // Всегда подтверждаем возможность платежа
      await ctx.answerPreCheckoutQuery(true);
  } catch (error) {
      console.error('Error in pre_checkout_query:', error);
  }
});

// Обработчик successful_payment
bot.on('successful_payment', async (ctx) => {
  try {
      const payment = ctx.message.successful_payment;
      const payload = payment.invoice_payload;
      const [type, telegramId, timestamp] = payload.split('_');

      if (type === 'boost') {
          const user = await User.findOne({ where: { telegramId } });
          if (!user) {
              console.error('User not found:', telegramId);
              return;
          }

          // Получаем текущие бусты
          const activeBoosts = JSON.parse(user.activeBoosts || '[]');
          
          // Определяем множитель на основе количества звезд
          const stars = payment.total_amount;
          let multiplier;
          if (stars === 100) multiplier = 2;
          else if (stars === 250) multiplier = 5;
          else if (stars === 500) multiplier = 10;
          else {
              console.error('Unknown stars amount:', stars);
              return;
          }

          // Добавляем новый буст
          const newBoost = {
              multiplier,
              startTime: Date.now(),
              duration: 24 * 60 * 60 * 1000 // 24 часа
          };

          activeBoosts.push(newBoost);

          // Обновляем бусты в базе
          await user.update({
              activeBoosts: JSON.stringify(activeBoosts)
          });

          // Отправляем сообщение пользователю
          await ctx.reply(`🌟 Буст x${multiplier} успешно активирован на 24 часа!`);
      }
  } catch (error) {
      console.error('Error in successful_payment:', error);
  }
});
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

const routes = {
  GET: {
    '/get-referral-link': async (req, res, query) => {
      const telegramId = query.telegramId;
      
      if (!telegramId) {
        return { status: 400, body: { error: 'Missing telegramId parameter' } };
      }

      try {
        const user = await User.findOne({ where: { telegramId } });
        if (user) {
          const inviteLink = `https://t.me/LITWIN_TAP_BOT?start=${user.referralCode}`;
          return { status: 200, body: { inviteLink } };
        } else {
          return { status: 404, body: { error: 'User not found' } };
        }
      } catch (error) {
        console.error('Error:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    },

    '/get-referred-friends': async (req, res, query) => {
      const telegramId = query.telegramId;
      
      if (!telegramId) {
        return { status: 400, body: { error: 'Missing telegramId parameter' } };
      }

      try {
        const user = await User.findOne({ where: { telegramId } });
        if (user) {
          const referredFriends = await User.findAll({
            where: { referredBy: user.referralCode },
            attributes: ['telegramId', 'username']
          });
          return { 
            status: 200, 
            body: { 
              referredFriends: referredFriends.map(friend => ({
                id: friend.telegramId,
                username: friend.username || `User${friend.telegramId}`
              })) 
            } 
          };
        } else {
          return { status: 404, body: { error: 'User not found' } };
        }
      } catch (error) {
        console.error('Error:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    },

    '/get-user-data': async (req, res, query) => {
      const telegramId = query.telegramId;
      
      if (!telegramId) {
        return { status: 400, body: { error: 'Missing telegramId parameter' } };
      }

      try {
        const user = await User.findOne({ where: { telegramId } });
        if (user) {
          return { 
            status: 200, 
            body: { 
              balance: user.balance, 
              tapProfit: user.tapProfit, 
              hourlyProfit: user.hourlyProfit,
              totalEarnedCoins: user.totalEarnedCoins
            }
          };
        } else {
          return { status: 404, body: { error: 'User not found' } };
        }
      } catch (error) {
        console.error('Error:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    },

    '/watch-ad': async (req, res, query) => {
      const { telegramId, uniqueId } = query;

      if (!telegramId || !uniqueId) {
        return { status: 400, body: { error: 'Telegram ID and Unique ID are required' } };
      }

      try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
          return { status: 404, body: { error: 'User not found' } };
        }

        if (user.lastAdUniqueId === uniqueId) {
          return { status: 200, body: { message: 'Ad already processed' } };
        }

        const adWatchCount = (user.adWatchCount || 0) + 1;
        
        await user.update({
          adWatchCount,
          lastAdUniqueId: uniqueId,
          lastAdWatchTime: Date.now()
        });

        return { status: 200, body: { success: true, adWatchCount } };
      } catch (error) {
        console.error('Error:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    },

    '/reward': async (req, res, query) => {
      const telegramId = query.userid;
      
      if (!telegramId) {
        return { status: 400, body: { error: 'Missing userid parameter' } };
      }

      try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
          return { status: 404, body: { error: 'User not found' } };
        }

        return { status: 200, body: { success: true, message: 'Reward applied' } };
      } catch (error) {
        console.error('Error:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    },

    '/verify-premium': async (req, res, query) => {
      const telegramId = query.telegramId;
      
      if (!telegramId) {
        return { status: 400, body: { error: 'Missing telegramId parameter' } };
      }

      try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
          return { status: 404, body: { error: 'User not found' } };
        }

        const activeBoosts = JSON.parse(user.activeBoosts || '[]');
        const currentTime = Date.now();
        const validBoosts = activeBoosts.filter(boost => 
          (boost.startTime + boost.duration) > currentTime
        );

        if (validBoosts.length !== activeBoosts.length) {
          await user.update({ activeBoosts: JSON.stringify(validBoosts) });
        }

        return { status: 200, body: { activeBoosts: validBoosts } };
      } catch (error) {
        console.error('Error:', error);
        return { status: 500, body: { error: 'Internal server error' } };
      }
    },
'/create-stars-invoice': async (req, res, query) => {
    const { telegramId, stars } = query;
    
    if (!telegramId || !stars) {
        return { status: 400, body: { error: 'Missing required parameters' } };
    }

    try {
        // Создаем Invoice для оплаты звездами через Telegraf
        const invoice = await bot.telegram.sendInvoice(
            parseInt(telegramId),
            {
                title: `Буст x${stars}`,
                description: 'Покупка буста в LITWIN TAP',
                payload: `boost_${telegramId}_${Date.now()}`,
                provider_token: '', // Пустой для звезд
                currency: 'XTR',
                prices: [{
                    label: `${stars} звезд`,
                    amount: parseInt(stars)
                }],
                start_parameter: `boost_${stars}`
            }
        );

        return { status: 200, body: { message_id: invoice.message_id } };
    } catch (error) {
        console.error('Error creating stars invoice:', error);
        return { status: 500, body: { 
            error: 'Failed to create invoice', 
            details: error.message 
        }};
    }
    }
  },

  POST: {
    '/sync-user-data': async (req, res) => {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { telegramId, username, balance, tapProfit, hourlyProfit, totalEarnedCoins } = data;
            
            if (!telegramId) {
              resolve({ status: 400, body: { error: 'Telegram ID is required' } });
              return;
            }

            let user = await User.findOne({ where: { telegramId: telegramId.toString() } });

            if (!user) {
              user = await User.create({
                telegramId: telegramId.toString(),
                username,
                balance,
                tapProfit,
                hourlyProfit,
                totalEarnedCoins,
                referralCode: crypto.randomBytes(4).toString('hex')
              });
            } else {
              await user.update({
                username,
                balance,
                tapProfit,
                hourlyProfit,
                totalEarnedCoins
              });
            }

            resolve({ 
              status: 200, 
              body: { 
                message: user ? 'User data updated successfully' : 'New user created',
                user: {
                  balance: user.balance,
                  tapProfit: user.tapProfit,
                  hourlyProfit: user.hourlyProfit,
                  totalEarnedCoins: user.totalEarnedCoins
                }
              } 
            });
          } catch (error) {
            console.error('Error:', error);
            resolve({ status: 500, body: { error: 'Internal server error', details: error.message } });
          }
        });
      });
    }
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
        fs.readFile(path.join(__dirname, '..', 'client', 'main.html'), (error, content) => {
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

  if (routes[method] && routes[method][pathname]) {
    const handler = routes[method][pathname];
    const result = await handler(req, res, parsedUrl.query);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
  } else {
    let filePath = path.join(__dirname, '..', 'litwin-server', req.url === '/' ? 'main.html' : req.url);
    serveStaticFile(filePath, res);
  }
});

const httpsPort = 3000;
const httpPort = 3001;

server.listen(httpsPort, () => {
  console.log(`HTTPS Сервер запущен на порту ${httpsPort}`);
  console.log('Telegram бот запущен');
  console.log(`HTTPS Сервер запущен на https://litwin-tap.ru`);
});

// HTTP to HTTPS redirect
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(httpPort, 'localhost', () => {
  console.log(`HTTP сервер запущен на порту ${httpPort} для перенаправления на HTTPS`);
});
// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));