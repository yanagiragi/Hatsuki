const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const FindPrice = require('./Plugins/FindPrice/plugin')
const GetSubscriptions = require('./Plugins/Subscriptions/plugin')

const token = fs.readFileSync(__dirname + '/../token.txt').toString().replace('\n','')
const accounts = JSON.parse(fs.readFileSync(__dirname + '/../id.json'))

const bot = new TelegramBot(token, {polling: true})

bot.onText(/\/start/, function (msg) {
    const chatId = msg.chat.id
    
    if (chatId !== accounts.Administrator){
        return
    }
    const resp = 'Bello, My Name is Hatsuki'
    bot.sendMessage(chatId, resp)
})

bot.onText(/\/findPrice (.+)/, async function (msg, match) {
    const chatId = msg.chat.id
    const title = match[1]
    console.log(`Searching ${title}`)
    const resp = await FindPrice(title)
    console.log(`Done Searching ${title}, result = ${resp}`)
    if (resp.length === 0) {
        bot.sendMessage(chatId, `Query: [${title}] Not Found ...`, { disable_web_page_preview: true })
        bot.sendPhoto(chatId, 'https://i.imgur.com/cOccc5J.jpg')
    }
    else {
        bot.sendMessage(chatId, resp, { disable_web_page_preview: true })
    }
})

async function Subscribes(){
    let result = await GetSubscriptions()    
    if (result != 'Find Results: 0'){
        result.split('\n\n').map(x => {
            bot.sendMessage(accounts.SendMessage, x);
        })
    }

    result.split('\n\n').map(x => {
        bot.sendMessage(accounts.Administrator, x);
    })
}

bot.onText(/\/test/, async (msg) => {
    const chatId = msg.chat.id
    if (chatId !== accounts.Administrator){
        return
    }

    await Subscribes()
});

setInterval(Subscribes, 1000 * 60 * 10)