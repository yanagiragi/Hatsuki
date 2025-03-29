const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['YtDLText.WebhookUrl'], config['YtDLText.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'YtDLText.Enabled',
    matches: [
        /^\/ytdltext (.*)/
    ],
    descriptions: ['ytdltext - Trigger a download youtube audio & convert to text job'],
    handler
}
