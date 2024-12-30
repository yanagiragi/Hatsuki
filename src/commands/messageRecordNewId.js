const { GetIdMetadata, SetIdMetadata } = require('../Plugins/IdMetadata')

async function handler (msg, match, config, bot) {
    const telegramId = msg.from.id
    const telegramName = msg.from.username

    if (!GetIdMetadata(telegramName)) {
        console.log(`Record ${telegramName} with id ${telegramId}`)
        SetIdMetadata(telegramName, telegramId)
    }
}

module.exports = {
    isAdminCommand: false,
    event: 'message',
    matches: [],
    handler
}
