const fs = require('fs')
const path = require('path')
const TelegramBot = require('node-telegram-bot-api')

// const FindPrice = require('./Plugins/FindPrice/plugin')
// const GetSubscriptions = require('./Plugins/Subscriptions/plugin')
const ParseTweet = require('./Plugins/ParseTweet')
const ImageShortcut = require('./Plugins/ImageShortcut')
const AvRecommend = require('./Plugins/7mmtv')

const configPath = path.join(__dirname, '/../config.json')
const config = JSON.parse(fs.readFileSync(configPath))
const isDev = config?.isDev ?? true

const bot = new TelegramBot(config.TelegramToken, { polling: true })

bot.onText(/\/start/, function (msg) {
    const chatId = msg.chat.id

    if (isDev && chatId !== config.Administrator) {
        return
    }

    ReplyMessage(msg, 'Bello, My Name is Hatsuki')
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
    if (config.Feature_RepostMatureTweet === null || config.Feature_RepostMatureTweet === false) {
        return
    }

    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const tweetAccount = match[1]
    const tweetId = match[2]
    const tweetShortName = `${tweetAccount}/${tweetId}`

    const tweet = await ParseTweet(tweetId, config.Twitter_CsrfToken, config.Twitter_AuthToken)
    if (tweet.isSensitive) {
        console.log(`Detect ${chatId} post a sensitive tweet, repost ${JSON.stringify(tweet)}`)
        for (let index = 0; index < tweet.photos.length; index++) {
            const photo = tweet.photos[index]
            await ReplyMessage(msg, `<${tweetShortName}> [${index}]: \n ${photo}`)
        }
    }
    else {
        console.log(`Detect ${chatId} post a tweet but content is save. Skip ${tweetShortName}`)
    }
})

bot.onText(/^(?!\/)(.*)$/, async (msg, match) => {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const option = {
        mode: 'post',
        key: match?.[1]
    }

    const matchShortCut = await ImageShortcut(option)
    console.log(`> Bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        const isSticker = matchShortCut.result.type === 'sticker'
        const send = isSticker ? ReplySticker : ReplyPhoto
        send(msg, matchShortCut.result.value)
    }
    else {

    }
})

bot.onText(/\/sc(.*)/, async (msg, match) => {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const isReply = msg?.reply_to_message != null
    const commandPrefix = 'sc'
    const modeRegexs = [
        {
            type: 'list',
            replyRegex: null,
            commandRegex: new RegExp(`/${commandPrefix}list$`)
        },
        {
            type: 'add',
            replyRegex: new RegExp(`/${commandPrefix}add (.*)$`),
            commandRegex: new RegExp(`/${commandPrefix}add (.*) (.*)$`)
        },
        {
            type: 'post',
            replyRegex: null,
            commandRegex: new RegExp(`/${commandPrefix}post (.*)$`)
        },
        {
            type: 'edit',
            replyRegex: new RegExp(`/${commandPrefix}edit (.*)$`),
            commandRegex: new RegExp(`/${commandPrefix}edit (.*) (.*)$`)
        },
        {
            type: 'delete',
            replyRegex: null,
            commandRegex: new RegExp(`/${commandPrefix}del (.*)$`)
        },
        {
            type: 'getlink',
            replyRegex: new RegExp(`/${commandPrefix}getlink`),
            commandRegex: null
        }
    ]

    const option = modeRegexs.map(x => {
        const replyMatch = msg.text.match(x.replyRegex)
        if (isReply && replyMatch) {
            const replyStickerId = msg?.reply_to_message?.sticker?.file_id
            const replyPhotoId = msg?.reply_to_message?.photo?.reverse()?.[0]?.file_id
            const isPhoto = replyStickerId === undefined
            return {
                mode: x.type,
                key: replyMatch?.[1],
                value: isPhoto ? replyPhotoId : replyStickerId,
                isPhoto
            }
        }

        const commandMatch = msg.text.match(x.commandRegex)
        if (commandMatch) {
            return {
                mode: x.type,
                key: commandMatch?.[1],
                value: commandMatch?.[2],
                isPhoto: true
            }
        }

        return null
    }).filter(Boolean)?.[0]

    console.log(`Detect ${chatId} request image shortcut with option [${JSON.stringify(option)}]`)

    // no match!
    if (option == null) {
        return
    }

    if (option.mode === 'getlink') {
        if (chatId !== config.Administrator) {
            console.log(`Skip getlink from ${chatId} since it is not an administrator`)
            return
        }

        const metadata = await bot.getFile(option.value)
        const link = `https://api.telegram.org/file/bot${config.TelegramToken}/${metadata.file_path}`
        ReplyMessage(msg, link)
        return
    }

    const matchShortCut = await ImageShortcut(option)
    console.log(`> Bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        const isSticker = matchShortCut.result.type === 'sticker'
        const send = isSticker ? ReplySticker : ReplyPhoto
        send(msg, matchShortCut.result.value)
    }
    else {
        ReplyMessage(msg, matchShortCut.message)
    }
})

bot.onText(/\/avr (.*)/, async (msg, match) => {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const isReply = msg?.reply_to_message != null
    const replyMessages = await AvRecommend(match?.[1])

    for (const replyMessage of replyMessages) {

        if (isReply) {
            await ReplyPhoto(msg, replyMessage.thumbnail, `${replyMessage.title}\n\n${replyMessage.href}`)
        }
        else {
            await SendPhoto(msg, replyMessage.thumbnail, `${replyMessage.title}\n\n${replyMessage.href}`)
        }
    }
})

async function SendMessage(msg, link) {
    try {
        bot.sendMessage(msg.chat.id, link)
    }
    catch (err) {
        console.error(err)
    }
}

async function ReplyMessage(msg, link) {
    try {
        bot.sendMessage(msg.chat.id, link, { reply_to_message_id: msg.message_id })
    }
    catch (err) {
        console.error(err)
    }
}

async function SendPhoto(msg, link, caption = null) {
    try {
        bot.sendPhoto(msg.chat.id, link, { caption })
    }
    catch (err) {
        console.error(err)
    }
}

async function ReplyPhoto(msg, link, caption = null) {
    try {
        bot.sendPhoto(msg.chat.id, link, { reply_to_message_id: msg.message_id, caption })
    }
    catch (err) {
        console.error(err)
    }
}

async function SendSticker(msg, link) {
    try {
        bot.sendSticker(msg.chat.id, link)
    }
    catch (err) {
        console.error(err)
    }
}

async function ReplySticker(msg, linkOrFileId) {
    try {
        bot.sendSticker(msg.chat.id, linkOrFileId, { reply_to_message_id: msg.message_id })
    }
    catch (err) {
        console.error(err)
    }
}
