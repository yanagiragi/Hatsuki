const { GetChannelAlias } = require('../Plugins/ChannelAlias')

async function handler (msg, match, config, bot) {
    const source = match[1]

    const target = GetChannelAlias(source)
    return bot.ReplyMessage(msg, `[ChannelAlias] Get ${source}: ${target}`)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/alias get (.*)/
    ],
    descriptions: ['alias - Get or set an alias'],
    handler
}
