const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['MegaDL.WebhookUrl'], config['MegaDL.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'MegaDL.Enabled',
    matches: [
        /^\/megadl (.*)/
    ],
    descriptions: ['megadl - Trigger a download mega job'],
    handler
}
