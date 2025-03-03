async function handler (msg, match, config, bot) {
    const tweetAccount = match[1]
    const tweetId = match[2]

    return bot.ReplyMessage(msg, `https://fxtwitter.com/${tweetAccount}/status/${tweetId}`)
}

module.exports = {
    isAdminCommand: false,
    enableConfig: 'RepostTwitterImage.Enabled',
    matches: [
        /^https:\/\/twitter.com\/(.*)\/status\/(\d+)/,
        /^https:\/\/x.com\/(.*)\/status\/(\d+)/,
    ],
    handler
}
