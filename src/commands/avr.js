const AvRecommend = require('../Plugins/7mmtv')

async function handler (msg, match, config, bot) {
    const isReply = msg?.reply_to_message != null
    const replyMessages = await AvRecommend(match?.[1])

    for (const replyMessage of replyMessages) {
        if (isReply) {
            await bot.ReplyPhoto(msg, replyMessage.thumbnail, `${replyMessage.title}\n\n${replyMessage.href}`)
        }
        else {
            await bot.SendPhoto(msg, replyMessage.thumbnail, `${replyMessage.title}\n\n${replyMessage.href}`)
        }
    }
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/avr (.*)/
    ],
    handler
}
