const fs = require('fs')
const path = require('path')
const TelegramBot = require('node-telegram-bot-api')

// const FindPrice = require('./Plugins/FindPrice/plugin')
// const GetSubscriptions = require('./Plugins/Subscriptions/plugin')
const ParseTweet = require('./Plugins/ParseTweet')
const ImageShortcut = require('./Plugins/ImageShortcut')
const AvRecommend = require('./Plugins/7mmtv')
const { GetChannelAlias, SetChannelAlias } = require('./Plugins/ChannelAlias')

const configPath = path.join(__dirname, '/../config.json')
const config = JSON.parse(fs.readFileSync(configPath))
const isDev = config?.isDev ?? true
const previousMessages = []
const maxPreviousMessagesLength = 4

const bot = new TelegramBot(config.TelegramToken, { polling: true })

bot.onText(/^\/start/, function (msg) {
    const chatId = msg.chat.id

    if (isDev && chatId !== config.Administrator) {
        return
    }

    ReplyMessage(msg, 'Bello, My Name is Hatsuki')
})

bot.onText(/^\/stat/, function (msg) {
    const chatId = msg.chat.id

    if (isDev && chatId !== config.Administrator) {
        return
    }

    ReplyMessage(msg, JSON.stringify(msg))
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

bot.onText(/^https:\/\/twitter.com\/(.*)\/status\/(\d+)/, async (msg, match) => {
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

    ReplyMessage(msg, `https://fxtwitter.com/${tweetAccount}/status/${tweetId}`)
})

// Handles multiple line messages
bot.onText(/^(?!\/)(.*)/, async (msg, match) => {
    const processedMsg = msg.text.replace(/[\n\t]/g, '')

    // if current message is a link, don't add it into previous messages
    if (processedMsg.startsWith('https://')) {
        return
    }

    previousMessages.push(processedMsg)
    while (previousMessages.length > maxPreviousMessagesLength) {
        console.log(`shift, len = ${previousMessages.length}`)
        previousMessages.shift()
    }
    console.log(`previousMessages = ${previousMessages}`)

    // normal case
    const processedMatch = processedMsg.match(/^(?!\/)(.*)$/)
    if (await HandleShortcut(msg, processedMatch)) {
        previousMessages.length = 0
    }

    // case consider previous message
    for (let i = 0; i < previousMessages.length; ++i) {
        const concatedPrevMessage = previousMessages.slice(i, previousMessages.length).join('')
        const concatedPrevMessageMatch = concatedPrevMessage.match(/^(?!\/)(.*)$/)
        if (await HandleShortcut(msg, concatedPrevMessageMatch)) {
            console.log(`concatedPrevMessage = ${concatedPrevMessage} matched. Clear previousMessages`)
            previousMessages.length = 0
            break
        }
        else {
            // console.log(`concatedPrevMessage = ${concatedPrevMessage} not matched.`)
        }
    }
})

async function HandleShortcut(msg, match) {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return false
    }

    const option = {
        mode: 'post',
        key: match?.[1]
    }

    const newChatId = GetChannelAlias(chatId)
    const matchShortCut = await ImageShortcut(newChatId, option)
    console.log(`> Bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        const send = ({
            sticker: ReplySticker,
            url: ReplyPhoto,
            photo: ReplyPhoto,
            animation: ReplyAnimation
        })[matchShortCut.result.type]
        send(msg, matchShortCut.result.value)

        return true
    }

    return false
}

bot.onText(/^\/sc(.*)/, async (msg, match) => {
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
            const replyAnimationId = msg?.reply_to_message?.animation?.file_id
            const isPhoto = replyPhotoId !== undefined
            const isAnimation = replyAnimationId !== undefined
            return {
                mode: x.type,
                key: replyMatch?.[1],
                value: isPhoto
                    ? replyPhotoId
                    : isAnimation
                        ? replyAnimationId
                        : replyStickerId,
                type: isPhoto
                    ? 'photo'
                    : isAnimation
                        ? 'animation'
                        : 'sticker'
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

    const newChatId = GetChannelAlias(chatId)
    const matchShortCut = await ImageShortcut(newChatId, option)
    console.log(`> Bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        const send = ({
            sticker: ReplySticker,
            url: ReplyPhoto,
            photo: ReplyPhoto,
            animation: ReplyAnimation
        })[matchShortCut.result.type]
        send(msg, matchShortCut.result.value)
    }
    else {
        ReplyMessage(msg, matchShortCut.message)
    }
})

bot.onText(/^\/avr (.*)/, async (msg, match) => {
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

bot.onText(/^\/alias get (.*)/, async (msg, match) => {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const source = match[1]

    const target = GetChannelAlias(source)
    ReplyMessage(msg, `[ChannelAlias] Get ${source}: ${target}`)
})

bot.onText(/^\/alias set (.*) (.*)/, async (msg, match) => {
    const chatId = msg.chat.id
    if (isDev && chatId !== config.Administrator) {
        console.log(`Skip message from ${chatId} since it is not an administrator`)
        return
    }

    const source = match[1]
    const target = match[2]

    const isSuccess = SetChannelAlias(source, target)
    ReplyMessage(msg, `[ChannelAlias] Set ${source} to ${target}: ${isSuccess}`)
})

function SendMessage(msg, content) {
    try {
        return bot.sendMessage(msg.chat.id, content)
    }
    catch (err) {
        console.error(err)
    }
}

function ReplyMessage(msg, content) {
    try {
        return bot.sendMessage(msg.chat.id, content, { reply_to_message_id: msg.message_id })
    }
    catch (err) {
        console.error(err)
    }
}

function SendPhoto(msg, fileId, caption = null) {
    try {
        return bot.sendPhoto(msg.chat.id, fileId, { caption })
    }
    catch (err) {
        console.error(err)
    }
}

function ReplyPhoto(msg, fileId, caption = null) {
    try {
        return bot.sendPhoto(msg.chat.id, fileId, { reply_to_message_id: msg.message_id, caption })
    }
    catch (err) {
        console.error(err)
    }
}

function SendSticker(msg, fileId) {
    try {
        return bot.sendSticker(msg.chat.id, fileId)
    }
    catch (err) {
        console.error(err)
    }
}

function ReplySticker(msg, fileId) {
    try {
        return bot.sendSticker(msg.chat.id, fileId, { reply_to_message_id: msg.message_id })
    }
    catch (err) {
        console.error(err)
    }
}

/**
* Wrapper of sendMediaGroup
* @param {*} msg telegram native passed object
* @param {*} photos photo metadata with { file_id, caption } format
* @returns awaitable sendMediaGroup calls
*/
function SendMediaGroup(msg, photos) {
    try {
        const media = photos.map(x => ({
            type: 'photo',
            media: x.file_id,
            caption: x.caption
        }))
        return bot.sendMediaGroup(msg.chat.id, media)
    }
    catch (err) {
        console.error(err)
    }
}

/**
* Wrapper of sendMediaGroup
* @param {*} msg telegram native passed object
* @param {*} photos photo metadata with { file_id, caption } format
* @returns awaitable sendMediaGroup calls
*/
function ReplyMediaGroup(msg, photos) {
    try {
        const media = photos.map(x => ({
            type: 'photo',
            media: x.file_id,
            caption: x.caption
        }))
        return bot.sendMediaGroup(msg.chat.id, media, { reply_to_message_id: msg.message_id })
    }
    catch (err) {
        console.error(err)
    }
}

function ReplyAnimation(msg, fileId) {
    try {
        return bot.sendAnimation(msg.chat.id, fileId, { reply_to_message_id: msg.message_id })
    }
    catch (err) {
        console.error(err)
    }
}

function SendAnimation(msg, fileId) {
    try {
        return bot.sendAnimation(msg.chat.id, fileId)
    }
    catch (err) {
        console.error(err)
    }
}
