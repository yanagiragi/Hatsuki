async function handler (msg, match, config, bot) {
    return bot.ReplyMessage(msg, 'Bello, My Name is Hatsuki')
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^\/start/
    ],
    handler
}
