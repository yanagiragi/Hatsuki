async function handler (msg, match, config, bot) {
    const title = 'Bello, My Name is Hatsuki'
    const thumbnail = config['Start.WelcomeImage']
    if (thumbnail) {
        return bot.ReplyPhoto(msg, thumbnail, title)
    }
    else {
        return bot.ReplyMessage(msg, title)
    }
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/start/
    ],
    enableConfig: 'Start.Enabled',
    descriptions: ['start - Greeting from the bot'],
    handler
}
