const { SetChannelAlias } = require('../Plugins/ChannelAlias')

async function handler (msg, match, config, bot) {
    const source = match[1]
    const target = match[2]

    const isSuccess = SetChannelAlias(source, target)
    return bot.ReplyMessage(msg, `[ChannelAlias] Set ${source} to ${target}: ${isSuccess}`)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/alias set (.*) (.*)/
    ],
    enableConfig: 'Alias.Enabled',
    descriptions: ['alias - Get or set an alias'],
    handler
}
