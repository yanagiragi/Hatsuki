const key = 'europeanId'

async function handler (msg, match, config, bot) {
    if (!config['EuropeanMode.Enabled']) {
        return
    }

    const europeanId = bot.GetBlackboard(key)
    if (europeanId != null && msg.from.id === europeanId) {
        // reply `too low favorability` sticker
        return bot.ReplySticker(msg, 'CAACAgUAAxkBAAJLyWUmHlfs7vnzHbfJfUy7iHSPGOhPAAKPAAOfYlYax9eyOy4eqeEwBA')
    }
}

module.exports = {
    isAdminCommand: false,
    event: 'message',
    matches: [],
    handler
}
