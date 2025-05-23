const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const { UpdateFeature } = require('../Plugins/EnableFeature')

async function handler (msg, match, config, bot) {
    const feature = match[1]
    const channel = GetChannelAlias(msg.chat.id)
    const result = UpdateFeature(feature, channel, false)
    return bot.ReplyMessage(msg, result)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/feature disable (.*)/
    ],
    enableConfig: 'Feature.Enabled',
    descriptions: ['feature - Enable/Disable/List the feature of the channel'],
    handler
}
