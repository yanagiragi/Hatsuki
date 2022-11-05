const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')

// const FindPrice = require('./Plugins/FindPrice/plugin')
// const GetSubscriptions = require('./Plugins/Subscriptions/plugin')
const ParseTweet = require('./Plugins/ParseTweet')
const ImageShortcut = require('./Plugins/ImageShortcut')

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

bot.onText(/https:\/\/twitter.com\/(.*)\/status\/(\d+)/, async (msg, match) => {

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
            await sendMessage(chatId, `<${tweetShortName}> [${index}]: \n ${photo}`)
        }
    }
    else {
        console.log(`Detect ${chatId} post a tweet but content is save. Skip ${tweetShortName}`)
    }
})

bot.onText(/\/(shortcut|sc) (.*)/, async (msg, match) => {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const args = match?.[2]?.split(' ')
    if (!args) 
    {
        console.log(`Unable to parse ${match}`)
        return
    }

    const option = { 
        isSettingMode: args.length > 1, 
        arg: { 
            key: args[0], 
            value: args[1] 
        }
    }
    
    const matchShortCut = await ImageShortcut(option)
    console.log(`Detect ${chatId} request image shortcut with option [${JSON.stringify(option)}], bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        const link = matchShortCut.result.link
        const isSticker = link.substring(link.length - 5, link.length) == '.webp'
        if (isSticker) {
            sendSticker(chatId, matchShortCut.result.link)
        }
        else {
            sendPhoto(chatId, matchShortCut.result.link)
        }
    }
    else {
        sendMessage(chatId, matchShortCut.message)
    }
})

async function sendMessage(chatId, link)
{
    try {
        bot.sendMessage(chatId, link)
    } catch (err) {
        console.error(err)
    }
}

async function sendPhoto(chatId, link)
{
    try {
        bot.sendPhoto(chatId, link)
    } catch (err) {
        console.error(err)
    }
}

async function sendSticker(chatId, link)
{
    try {
        bot.sendSticker(chatId, link)
    } catch (err) {
        console.error(err)
    }
}