const { GetIdMetadata } = require('../Plugins/IdMetadata')

async function handler (msg, match, config, bot) {
    const target = GetIdMetadata(match?.[1]) ?? match?.[1]
    const message = match?.[2]
    return bot.SendMessage({ chat: { id: target } }, message)
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/send ([a-zA-Z0-9]+) (.*)/
    ],
    enableConfig: 'SendMessage.Enabled',
    handler
}
