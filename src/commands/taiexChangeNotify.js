const { CheckBelowTwoPercent } = require('../Plugins/TaiexPriceNotify')

async function trigger (bot, config) {
    let intervalId = null
    if (config?.['TaiexPriceNotify.Enabled']) {
        const interval = config['TaiexPriceNotify.Interval']
        const token = config?.['TaiexPriceNotify.FugleToken']
        const notifyText = config?.['TaiexPriceNotify.NotifyText']
        const chatIdList = config?.['TaiexPriceNotify.ChatIdList']
        if (interval > 0 && token && notifyText) {
            console.log(`Schedule to check Taiex price every ${interval} seconds`)
            intervalId = setInterval(async () => {
                const { isBelow, metadata, needUpdate } = await CheckBelowTwoPercent(token)
                const shouldNotify = isBelow && needUpdate
                if (shouldNotify) {
                    for (const { chatId } of chatIdList) {
                        await bot.SendMessage({ chat: { id: chatId } }, notifyText)
                    }
                }
            }, interval * 1000)
        }
    }
    return intervalId
}

module.exports = {
    isAdminCommand: true,
    isJob: true,
    enableConfig: 'TaiexPriceNotify.Enabled',
    trigger
}
