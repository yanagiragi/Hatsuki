const { AddDecorType } = require('../Plugins/Pikmin')

async function handler (msg, match, config, bot) {
    const commandType = match?.[1]
    const arg = msg.text.replace(`/pkmdecor ${commandType}`, '').trim()
    if (commandType !== 'add') {
        return bot.ReplyMessage(msg, 'Unknown command')
    }
    return AddDecorType(bot, msg, arg)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/pkmdecor ([a-z]*)/
    ],
    enableConfig: 'PikminBloom.Enabled',
    descriptions: ['pkmdecor - Add a new pikmin decor type'],
    handler
}
