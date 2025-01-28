const { UpdateFeature } = require('../Plugins/EnableFeature')

async function handler (msg, match, config, bot) {
    const feature = match[1]
    const channel = msg.chat.id
    const result = UpdateFeature(feature, channel, true)
    return bot.ReplyMessage(msg, result)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/feature enable (.*)/
    ],
    descriptions: ['feature - Enable or disable the feature of the channel'],
    handler
}
