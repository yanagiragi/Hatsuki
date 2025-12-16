const { ParseEntry, AddEntry, EditEntry, RemoveEntry, ListEntry } = require('../Plugins/Pikmin')

async function handler (msg, match, config, bot) {
    const commandType = match?.[1]
    const command = msg.text.replace(`/pkm ${commandType}`, '').trim()
    const entry = ParseEntry(command)

    if (commandType == 'add') {
        return AddEntry(bot, msg, msg.from.id, entry)
    }

    else if (commandType == 'del') {
        return RemoveEntry(bot, msg, msg.from.id, entry)
    }

    else if (commandType == 'list') {
        return ListEntry(bot, msg, msg.from.id, entry)
    }
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/pkm ([a-z]*)/
    ],
    enableConfig: 'PikminBloom.Enabled',
    descriptions: ['pkm - Get or set a pikmin bloom entry'],
    handler
}
