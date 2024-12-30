const { GetIdMetadatas } = require('../Plugins/IdMetadata')

async function handler (msg, match, config, bot) {
    const metadata = GetIdMetadatas()
    return bot.ReplyMessage(msg, JSON.stringify(metadata))
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/getid/
    ],
    handler
}
