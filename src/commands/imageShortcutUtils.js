const { ToCDB } = require('../utils')

const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const ImageShortcut = require('../Plugins/ImageShortcut')

async function HandleShortcut (msg, matchedContent, config, bot) {
    const chatId = msg.chat.id
    const option = {
        mode: 'post',
        key: matchedContent
    }
    const newChatId = GetChannelAlias(chatId)
    const matchShortCut = await ImageShortcut(newChatId, option)
    console.log(`> Bot responses [${JSON.stringify(matchShortCut)}]`)

    if (matchShortCut.isOK && matchShortCut.result) {
        if (matchShortCut.result.type === 'sticker') {
            await bot.ReplySticker(msg, matchShortCut.result.value)
        }
        else if (matchShortCut.result.type === 'url') {
            await bot.ReplyPhoto(msg, matchShortCut.result.value)
        }
        else if (matchShortCut.result.type === 'photo') {
            await bot.ReplyPhoto(msg, matchShortCut.result.value)
        }
        else if (matchShortCut.result.type === 'animation') {
            await bot.ReplyAnimation(msg, matchShortCut.result.value)
        }

        if (config['ImageShortcut.Report.Enabled']) {
            await bot.SendMessage({
                chat: {
                    id: config['ImageShortcut.Report.ChatId']
                }
            }, `matchedContent = ${matchedContent}, result = ${JSON.stringify(matchShortCut.result)}`)
        }

        return true
    }

    return false
}

function PreprocessShortcutMessage (message) {
    let result = ToCDB(message)
    result = result.replace(/[\n\t]/g, '')
    return result
}

module.exports = { HandleShortcut, PreprocessShortcutMessage }
