const MyGoImageFetch = require('../Plugins/MyGoImage')

async function handler (msg, match, config, bot) {
    const url = MyGoImageFetch(msg.text)
    if (url) {
        return bot.ReplyPhoto(msg, url)
    }
}

module.exports = {
    isAdminCommand: false,
    enableConfig: 'MyGoImage.Enabled',
    event: 'message',
    matches: [],
    handler
}
