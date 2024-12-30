const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const ImageShortcut = require('../Plugins/ImageShortcut')

async function handler (msg, match, config, bot) {
    const chatId = msg.chat.id
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
        bot.ReplyMessage(msg, link)
        return
    }

    const newChatId = GetChannelAlias(chatId)
    const matchShortCut = await ImageShortcut(newChatId, option)
    console.log(`> Bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        const send = ({
            sticker: bot.ReplySticker,
            url: bot.ReplyPhoto,
            photo: bot.ReplyPhoto,
            animation: bot.ReplyAnimation
        })[matchShortCut.result.type]
        send(msg, matchShortCut.result.value)
    }
    else {
        await bot.ReplyMessage(msg, matchShortCut.message)
    }
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/sc(.*)/
    ],
    handler
}
