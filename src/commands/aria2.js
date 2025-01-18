const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    if (!config['Aria2.Enabled']) {
        return
    }

    const url = match?.[1]
    const content = await NotifyWebhook(config['Aria2.WebhookUrl'], config['Aria2.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/aria2 (.*)/
    ],
    handler
}
