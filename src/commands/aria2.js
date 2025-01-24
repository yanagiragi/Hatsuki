const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['Aria2.WebhookUrl'], config['Aria2.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'Aria2.Enabled',
    matches: [
        /^\/aria2 (.*)/
    ],
    descriptions: ['aria2 - Trigger a magnet download job'],
    handler
}
