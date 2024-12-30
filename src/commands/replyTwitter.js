async function handler (msg, match, config, bot) {
    if (config.Feature_RepostMatureTweet === null || config.Feature_RepostMatureTweet === false) {
        return
    }

    const tweetAccount = match[1]
    const tweetId = match[2]

    return bot.ReplyMessage(msg, `https://fxtwitter.com/${tweetAccount}/status/${tweetId}`)
}

module.exports = {
    isAdminCommand: false,
    matches: [
        /^https:\/\/twitter.com\/(.*)\/status\/(\d+)/,
        /^https:\/\/x.com\/(.*)\/status\/(\d+)/,
    ],
    handler
}
