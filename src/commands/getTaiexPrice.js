const { GetMetadata } = require('../Plugins/TaiexPriceNotify')

async function handler (msg, match, config, bot) {
    const token = config?.['TaiexPriceNotify.FugleToken']
    if (!token) {
        console.error('No token provided')
        return;
    }

    const metadata = await GetMetadata(token)
    const message = JSON.stringify(metadata, null, 4)

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
