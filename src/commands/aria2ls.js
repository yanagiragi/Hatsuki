const fetch = require('node-fetch')
const Aria2 = require('aria2')
const { FormatFileSize } = require('../utils')

async function handler (msg, match, config, bot) {
    const host = config['Aria2.JsonRpcUrl']
    const secret = config['Aria2.JsonRpcSecret']

    const aria2 = new Aria2({ fetch, host, secret })
    const activeDownloads = await aria2.call('tellActive')

    const content = activeDownloads.reduce((acc, ele) => {
        const percentage = ele.totalLength === '0' ? 0 : parseFloat(ele.completedLength) / parseFloat(ele.totalLength)
        const title = ele.bittorrent?.info?.name ?? ele.files[0].path
        const downloadSpeed = FormatFileSize(parseInt(ele.downloadSpeed))
        return acc + `${title}: ${percentage.toFixed(2)}% (${downloadSpeed}/s)\n`
    }, 'Aria Active Downloads:\n\n')

    return bot.ReplyMessage(msg, content.trim())
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'Aria2.Enabled',
    matches: [
        /^\/aria2ls/
    ],
    descriptions: ['aris2ls - List aria2 active donwloads'],
    handler
}
