const { NotifyWebhook } = require('../utils')
const { GetMetadata } = require('../Plugins/TaiexPriceNotify')

function formatMax2 (n) {
    return String(Math.round(n * 100) / 100)
}

async function handler (msg, match, config, bot) {
    const token = config?.['TaiexPriceNotify.FugleToken']
    if (!token) {
        console.error('No token provided')
        return;
    }

    const metadata = await GetMetadata(token)
    const message = `openPrice = ${metadata.openPrice}, lowPrice = ${metadata.lowPrice}, diff = ${formatMax2((metadata.lowPrice / metadata.openPrice - 1) * 100)}%`

    return bot.ReplyMessage(msg, message)
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'TaiexPriceNotify.Enabled',
    matches: [
        /^\/get_taiex_price/
    ],
    descriptions: ['get_taiex_price - get metadata of TAIEX'],
    handler
}
