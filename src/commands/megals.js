const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const content = await NotifyWebhook(config['Megals.WebhookUrl'], config['Megals.WebhookToken'])
    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'Megals.Enabled',
    matches: [
        /^\/megals/
    ],
    descriptions: ['megals - List download mega jobs'],
    handler
}
