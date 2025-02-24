const fs = require('fs')
const { GetImage, SetFileId } = require('../Plugins/MeowMeowImage')

async function handler (msg, match, config, bot) {
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
