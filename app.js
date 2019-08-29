const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')

const token = fs.readFileSync(__dirname + '/token.txt')

const bot = new TelegramBot(token, {polling: true})

bot.onText(/\/start/, function (msg) {
    const chatId = msg.chat.id
    const resp = 'Bello, My Name is Hatsuki'
    bot.sendMessage(chatId, resp)
})

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Received your message');
});