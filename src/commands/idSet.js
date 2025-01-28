const { GetIdMetadata, SetIdMetadata } = require('../Plugins/IdMetadata')

async function handler (msg, match, config, bot) {
    const alias = match?.[1]
    const id = match?.[2]
    const metadata = GetIdMetadata(alias)

    SetIdMetadata(alias, id)

    const message = metadata ? `Update ${alias} to ${id}` : `Add ${alias} as ${id}`
    return bot.ReplyMessage(msg, message)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/setid (.*) (.*)/
    ],
    enableConfig: 'Id.Enabled',
    handler
}
