const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const FindPrice = require('./Plugins/FindPrice/plugin')

const token = fs.readFileSync(__dirname + '/../token.txt')

const bot = new TelegramBot(token, {polling: true})

bot.onText(/\/start/, function (msg) {
    const chatId = msg.chat.id
    const resp = 'Bello, My Name is Hatsuki'
    bot.sendMessage(chatId, resp)
})

bot.onText(/\/findPrice (.+)/, async function (msg, match) {
    const chatId = msg.chat.id
    const title = match[1]
    console.log(`Searching ${title}`)
    const resp = await FindPrice(title)
    console.log(`Done Searching ${title}, result = ${resp}`)
    bot.sendMessage(chatId, resp, { disable_web_page_preview: true })
})

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hatsuki has received your message');
});