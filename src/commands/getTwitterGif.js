const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['GetTwitterGif.WebhookUrl'], config['GetTwitterGif.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'GetTwitterGif.Enabled',
    matches: [
        /^\/gettwittergif (.*)/
    ],
    descriptions: ['gettwittergif - Trigger a download twitter video job'],
    handler
}
