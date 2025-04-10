const MujicaImageFetch = require('../Plugins/MujicaImage')

async function handler (msg, match, config, bot) {
    const url = MujicaImageFetch(msg.text)
    if (url) {
        return bot.ReplyPhoto(msg, url)
    }
}

module.exports = {
    isAdminCommand: false,
    enableConfig: 'MujicaImage.Enabled',
    event: 'message',
    matches: [],
    handler
}
