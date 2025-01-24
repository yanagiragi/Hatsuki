const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['YtDLMp3.WebhookUrl'], config['YtDLMp3.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'YtDLMp3.Enabled',
    matches: [
        /^\/ytdlmp3 (.*)/
    ],
    descriptions: ['ytdlmp3 - Trigger a download youtube audio job'],
    handler
}
