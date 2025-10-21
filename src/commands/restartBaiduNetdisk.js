const { NotifyWebhook } = require('../utils')

async function handler (msg, match, config, bot) {
    const url = match?.[1]
    const content = await NotifyWebhook(config['RestartBaiduNetdisk.WebhookUrl'], config['RestartBaiduNetdisk.WebhookToken'], { message: url })

    return bot.ReplyMessage(msg, content)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'RestartBaiduNetdisk.Enabled',
    matches: [
        /^\/restartbaidunetdisk/
    ],
    descriptions: ['restartbaidunetdisk - Trigger a restart baidu netdisk job'],
    handler
}
