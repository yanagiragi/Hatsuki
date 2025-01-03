const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    if (!config['YtDLMp3.Enabled']) {
        return
    }

    const url = match?.[1]
    const content = await NotifyWebhook(config['YtDLMp3.WebhookUrl'], config['YtDLMp3.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/ytdlmp3 (.*)/
    ],
    handler
}
