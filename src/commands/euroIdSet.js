const { GetIdMetadata } = require('../Plugins/IdMetadata')

const key = 'europeanId'

async function handler (msg, match, config, bot) {
    if (msg.from.id !== config['Bot.Administrator']) {
        console.log(`Detect ${msg.from.id} requests admin command`)
        // reply `thanks for your advices` sticker
        return bot.ReplySticker(msg, 'CAACAgUAAxkBAAICpmUmikfaQ3LyItyiVXhnQCNMyUagAAJSBgACTV9AVeKw46ho_0jGMAQ')
    }

    const alias = match?.[1]

    if (alias === 'null') {
        bot.SetBlackboard(key, null)
        return bot.ReplyMessage(msg, 'Success set euro Id to null')
    }

    const metadata = GetIdMetadata(alias)
    if (!metadata) {
        return bot.ReplyMessage(msg, `Unable to find id: ${alias}`)
    }

    bot.SetBlackboard(key, metadata)
    return bot.ReplyMessage(msg, `Success set euro Id to ${alias}`)
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/seteuroid (.*)/
    ],
    handler
}
