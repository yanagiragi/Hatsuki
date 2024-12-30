const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    if (!config['MegaDL.Enabled']) {
        return
    }

    const url = match?.[1]
    const content = await NotifyWebhook(config['MegaDL.WebhookUrl'], config['MegaDL.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/megadl (.*)/
    ],
    handler
}
