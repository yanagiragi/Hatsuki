async function handler (msg, match, config, bot) {
    return bot.ReplyMessage(msg, JSON.stringify(msg))
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/stat/
    ],
    descriptions: ['stat - List status of the channel'],
    enableConfig: 'Stat.Enabled',
    handler
}
