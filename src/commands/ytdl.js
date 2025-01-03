const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    if (!config['YtDL.Enabled']) {
        return
    }

    const url = match?.[1]
    const content = await NotifyWebhook(config['YtDL.WebhookUrl'], config['YtDL.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/ytdl (.*)/
    ],
    handler
}
