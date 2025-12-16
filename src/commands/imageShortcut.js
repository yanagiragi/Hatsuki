const { Sample } = require('../utils')
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
            const replyVoiceId = msg?.reply_to_message?.voice?.file_id ?? msg?.reply_to_message?.audio?.file_id
            const typeMap = {
                'voice': replyVoiceId,
                'photo': replyPhotoId,
                'animation': replyAnimationId,
                'sticker': replyStickerId
            }
            const matchTypeEntry = Object.entries(typeMap).find((ele, idx) => ele[1] != null)
            console.log(typeMap, matchTypeEntry)
            return {
                mode: x.type,
                key: replyMatch?.[1],
                value: matchTypeEntry[1],
                type: matchTypeEntry[0]
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
        if (chatId !== config['Bot.Administrator']) {
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
        const result = Sample(matchShortCut.result)
        if (result.type === 'sticker') {
            await bot.ReplySticker(msg, result.value)
        }
        else if (result.type === 'url') {
            await bot.ReplyPhoto(msg, result.value)
        }
        else if (result.type === 'photo') {
            await bot.ReplyPhoto(msg, result.value)
        }
        else if (result.type === 'animation') {
            await bot.ReplyAnimation(msg, result.value)
        }
        else if (result.type === 'voice') {
            await bot.ReplyVoice(msg, result.value)
        }
    }
    else {
        if (matchShortCut.message.length > 4096) {
            const chunkSize = 100
            for (let i = 0; i < matchShortCut.raw.length; i += chunkSize) {
                const chunk = matchShortCut.raw.slice(i, i + chunkSize)
                await bot.ReplyMessage(msg, `Available options (${i + 1}/${matchShortCut.raw.length}) are:\n${JSON.stringify(chunk, null, 4)}`)
            }
        }
        else {
            await bot.ReplyMessage(msg, matchShortCut.message)
        }
    }
}

module.exports = {
    isAdminCommand: false,
    enableConfig: 'ImageShortcut.Enabled',
    matches: [
        /^\/sc(.*)/
    ],
    descriptions: [
        'sclist - print image shortcut list',
        'scadd - add image shortcut',
        'scedit - add image shortcut',
        'scdelete - remove image shortcut',
    ],
    handler
}
