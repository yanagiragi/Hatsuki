const { Search } = require('../Plugins/MeowMeowImage')

async function handler (msg, match, config, bot) {
    const text = match?.[1]
    if (!text) {
        console.log(`Unable to find any match in ${msg}`)
        return
    }

    const takeAmount = config?.['FindMeowMeowImage.TakeAmount'] ?? 5
    const matches = Search(text, takeAmount)
    return bot.ReplyMessage(msg, JSON.stringify(matches, null, 4))
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/findmm (.*)/
    ],
    enableConfig: 'FindMeowMeowImage.Enabled',
    descriptions: ['findmm - Search meow meow title'],
    handler
}
