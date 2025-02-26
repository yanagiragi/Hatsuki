const fs = require('fs')
const { GetImage, SetFileId } = require('../Plugins/MeowMeowImage')
const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const ImageShortcut = require('../Plugins/ImageShortcut')

async function handler (msg, match, config, bot) {
    // Check ImageShortcut has any match first
    const chatId = msg.chat.id
    const option = {
        mode: 'post',
        key: msg.text
    }
    const newChatId = GetChannelAlias(chatId)
    const matchShortCut = await ImageShortcut(newChatId, option)
    if (matchShortCut.isOK) {
        console.log(`Detect has ImageShortCut match of ${msg.text}, quick abort.`)
        return
    }

    const result = GetImage(msg.text)
    if (!result) {
        return
    }

    const { id, filepath, fileId } = result
    if (fileId) {
        return bot.ReplyPhoto(msg, fileId)
    }
    else if (filepath && fs.existsSync(filepath)) {
        const buffer = fs.readFileSync(filepath)
        const resp = await bot.ReplyPhoto(msg, buffer, {}, { filename: id })
        const uploadedFileId = resp?.photo?.pop()?.file_id
        if (uploadedFileId) {
            SetFileId(id, uploadedFileId)
        }
    }
    else {
        console.error(`Unable to read ${filepath}`)
    }
}

module.exports = {
    isAdminCommand: false,
    enableConfig: 'MeowMeowImage.Enabled',
    event: 'message',
    matches: [],
    handler
}
