const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')

// const FindPrice = require('./Plugins/FindPrice/plugin')
// const GetSubscriptions = require('./Plugins/Subscriptions/plugin')
const ParseTweet = require('./Plugins/ParseTweet/plugin')

const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'))
const isDev = config?.isDev ?? true

const bot = new TelegramBot(config.TelegramToken, { polling: true })

bot.onText(/\/start/, function (msg) {
    const chatId = msg.chat.id

    if (isDev && chatId !== config.Administrator) {
        return
    }
    const resp = 'Bello, My Name is Hatsuki'
    bot.sendMessage(chatId, resp)
})

// bot.onText(/\/findPrice (.+)/, async function (msg, match) {
//     const chatId = msg.chat.id
//     const title = match[1]
//     console.log(`Searching ${title}`)
//     const resp = await FindPrice(title)
//     console.log(`Done Searching ${title}, result = ${resp}`)
//     if (resp.length === 0) {
//         bot.sendMessage(chatId, `Query: [${title}] Not Found ...`, { disable_web_page_preview: true })
//         bot.sendPhoto(chatId, 'https://i.imgur.com/cOccc5J.jpg')
//     }
//     else {
//         bot.sendMessage(chatId, resp, { disable_web_page_preview: true })
//     }
// })

// async function Subscribes() {
//     let result = await GetSubscriptions()
//     if (result != 'Find Results: 0') {
//         result.split('\n\n').map(x => {
//             bot.sendMessage(accounts.SendMessage, x);
//         })
//     }
// 
//     result.split('\n\n').map(x => {
//         bot.sendMessage(accounts.Administrator, x);
//     })
// }

// bot.onText(/\/test/, async (msg) => {
//     const chatId = msg.chat.id
//     if (chatId !== accounts.Administrator) {
//         return
//     }
// 
//     await Subscribes()
// });

// setInterval(Subscribes, 1000 * 60 * 10)

bot.onText(/https:\/\/twitter.com\/(.*)\/status\/(\d+)/, async function (msg, match) {

    if (config.Feature_RepostMatureTweet == null || config.Feature_RepostMatureTweet == false) {
        return
    }

    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const tweetUrl = match[0]
    const tweetAccount = match[1]
    const tweetId = match[2]
    const tweetShortName = `${tweetAccount}/${tweetId}`

    const tweet = await ParseTweet(tweetId, config.Twitter_CsrfToken, config.Twitter_AuthToken)
    if (tweet.isSensitive) {
        console.log(`Detect ${chatId} post a sensitive tweet, repost ${JSON.stringify(tweet)}`)
        for (let index = 0; index < tweet.photos.length; index++) {
            const photo = tweet.photos[index];
            await bot.sendMessage(chatId, `<${tweetShortName}> [${index}]: \n ${photo}`)
        }
    }
    else {
        console.log(`Detect ${chatId} post a tweet but content is save. Skip ${tweetShortName}`)
    }
})