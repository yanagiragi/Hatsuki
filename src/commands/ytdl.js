const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['YtDL.WebhookUrl'], config['YtDL.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'YtDL.Enabled',
    matches: [
        /^\/ytdl (.*)/
    ],
    descriptions: ['ytdl - Trigger a download youtube video job'],
    handler
}
