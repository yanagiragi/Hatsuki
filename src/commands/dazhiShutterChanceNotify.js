const { CheckHasChance } = require('../Plugins/DazhiShutterChanceNotify')

async function trigger (bot, config) {
    let intervalId = null
    if (config?.['DazhiShutterChangeNotify.Enabled']) {
        const interval = config['DazhiShutterChangeNotify.Interval']
        const endpoint = config?.['DazhiShutterChangeNotify.Endpoint']
        const token = config?.['DazhiShutterChangeNotify.Token']
        const notifyText = config?.['DazhiShutterChangeNotify.NotifyText']
        const chatIdList = config?.['DazhiShutterChangeNotify.ChatIdList']
        if (interval > 0 && endpoint && notifyText) {
            console.log(`Schedule to check price every ${interval} seconds`)
            const checkAndNotify = async () => {
                const result = await CheckHasChance(endpoint, token)
                if (!result) {
                    return
                }

                const { hasChance, metadata, needUpdate } = result
                const shouldNotify = hasChance && needUpdate
                if (shouldNotify) {
                    for (const { chatId } of chatIdList) {
                        await bot.SendMessage({ chat: { id: chatId } }, notifyText)
                    }
                }
            }
            checkAndNotify()
            intervalId = setInterval(checkAndNotify, interval * 1000)
        }
    }
    return intervalId
}

module.exports = {
    isAdminCommand: true,
    isJob: true,
    enableConfig: 'DazhiShutterChangeNotify.Enabled',
    trigger
}
