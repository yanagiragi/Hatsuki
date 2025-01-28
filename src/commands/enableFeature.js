const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const { UpdateFeature } = require('../Plugins/EnableFeature')

async function handler (msg, match, config, bot) {
    const feature = match[1]
    const channel = GetChannelAlias(msg.chat.id)
    const result = UpdateFeature(feature, channel, true)
    return bot.ReplyMessage(msg, result)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/feature enable (.*)/
    ],
    enableConfig: 'Feature.Enabled',
    descriptions: ['feature - enable/disable/list the feature of the channel'],
    handler
}
