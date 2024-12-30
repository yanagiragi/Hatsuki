const key = 'europeanId'

async function handler (msg, match, config, bot) {
    const telegramId = msg.from.id
    const telegramName = msg.from.username

    const europeanId = bot.GetBlackboard(key)
    if (europeanId != null && telegramId === europeanId) {
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
