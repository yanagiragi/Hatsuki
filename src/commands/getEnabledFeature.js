const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const { GetEnabledFeature } = require('../Plugins/EnableFeature')

async function handler (msg, match, config, bot) {
    const channel = GetChannelAlias(msg.chat.id)
    const result = GetEnabledFeature(channel)
    return bot.ReplyMessage(msg, `Enabled feature of [${channel}] are: [${result}]`)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/feature list/
    ],
    enableConfig: 'Feature.Enabled',
    descriptions: ['feature - Enable/Disable/List the feature of the channel'],
    handler
}
