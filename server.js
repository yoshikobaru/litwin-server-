const https = require('https');  
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');
const crypto = require('crypto');
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const url = require('url');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT
  }
);

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
  premiumTapLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  premiumHourlyLevel: {  // Добавляем это поле
    type: DataTypes.INTEGER,
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
      const [type, telegramId, upgradeType] = payload.split('_');

      if (type === 'premium') {
          const user = await User.findOne({ where: { telegramId } });
          if (!user) {
              console.error('User not found:', telegramId);
              return;
          }

          const stars = payment.total_amount;
          let currentLevel;
          let newProfit;

          if (upgradeType === 'tap') {
              currentLevel = user.premiumTapLevel;
              if (currentLevel >= 3) {
                  await ctx.reply('❌ Достигнут максимальный уровень улучшения!');
                  return;
              }
              // Используем фиксированные значения прибыли вместо множителей
              const tapProfits = [50, 150, 300];
              newProfit = user.tapProfit + tapProfits[currentLevel];
              await user.update({
                  tapProfit: newProfit,
                  premiumTapLevel: currentLevel + 1
              });
          } else if (upgradeType === 'hourly') {
            if (!user.premiumHourlyLevel) {
                await user.update({ premiumHourlyLevel: 0 });
            }
            currentLevel = user.premiumHourlyLevel;
              if (currentLevel >= 3) {
                  await ctx.reply('❌ Достигнут максимальный уровень улучшения!');
                  return;
              }
              // Используем фиксированные значения прибыли вместо множителей
              const hourlyProfits = [5000, 20000, 50000];
              newProfit = user.hourlyProfit + hourlyProfits[currentLevel];
              await user.update({
                  hourlyProfit: newProfit,
                  premiumHourlyLevel: currentLevel + 1
              });
          }

          await ctx.reply(`✨ Премиум улучшение успешно активировано!\nПрибыль увеличена за ${upgradeType === 'tap' ? 'тап' : 'час'}!`);
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
                    totalEarnedCoins: user.totalEarnedCoins,
                    premiumTapLevel: user.premiumTapLevel,
                    premiumHourlyLevel: user.premiumHourlyLevel
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

        // Обновляем только счетчик просмотров рекламы
        await user.update({
            adWatchCount: (user.adWatchCount || 0) + 1
        });

        return { status: 200, body: { 
            success: true, 
            message: 'Ad view recorded',
            adWatchCount: user.adWatchCount + 1
        }};
    } catch (error) {
        console.error('Error in reward endpoint:', error);
        return { status: 500, body: { error: 'Internal server error' } };
    }
    },
    '/update-premium-multiplier': async (req, res, query) => {
    const { telegramId, type, level } = query;
    
    if (!telegramId || !type || !level) {
        return { status: 400, body: { error: 'Missing required parameters' } };
    }

    try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            return { status: 404, body: { error: 'User not found' } };
        }

        // Просто обновляем уровень, без изменения профита
        const updateData = type === 'tap' ? 
            { premiumTapLevel: parseInt(level) } :
            { premiumHourlyLevel: parseInt(level) };

        await user.update(updateData);

        return { 
            status: 200, 
            body: { 
                success: true,
                newProfit: type === 'tap' ? user.tapProfit : user.hourlyProfit
            } 
        };
    } catch (error) {
        console.error('Error updating premium multiplier:', error);
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
    const { telegramId, upgradeType } = query;
    
    if (!telegramId || !upgradeType) {
        return { status: 400, body: { error: 'Missing required parameters' } };
    }

    try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            return { status: 404, body: { error: 'User not found' } };
        }

        const currentLevel = upgradeType === 'tap' ? 
            user.premiumTapLevel : user.premiumHourlyLevel;

        if (currentLevel >= 3) {
            return { status: 400, body: { error: 'Maximum level reached' } };
        }

        const prices = [
            { label: '⭐ Уровень 1', amount: 100 },
            { label: '⭐⭐ Уровень 2', amount: 250 },
            { label: '⭐⭐⭐ Уровень 3', amount: 500 }
        ];

        const invoice = await bot.telegram.createInvoiceLink({
            title: upgradeType === 'tap' ? 'Премиум ТАП' : 'Премиум ПРИБЫЛЬ',
            description: 'Премиум улучшение в LITWIN TAP',
            payload: `premium_${telegramId}_${upgradeType}`,
            provider_token: "",
            currency: 'XTR',
            prices: [prices[currentLevel]]
        });

        return { status: 200, body: { slug: invoice } };
    } catch (error) {
        console.error('Error creating stars invoice:', error);
        return { status: 500, body: { error: 'Failed to create invoice' } };
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