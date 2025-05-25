const fetch = require('node-fetch')
const Aria2 = require('aria2')
const { FormatFileSize, Truncate } = require('../utils')

const maxResultAmount = 1000

async function handler (msg, match, config, bot) {
    const host = config['Aria2.JsonRpcUrl']
    const secret = config['Aria2.JsonRpcSecret']
    const maxFilenameLength = config?.['Aria2.MaxFilenameLength'] ?? 25

    const aria2 = new Aria2({ fetch, host, secret })
    const multicall = [
        ['tellActive'],
        ['tellWaiting', 0, maxResultAmount],
        ['tellStopped', 0, maxResultAmount],
    ]
    const results = await aria2.multicall(multicall)

    let content = ''
    content += `# Active Downloads:\n\n${ParseResponse(results[0][0], maxFilenameLength)}`
    content += `# Waiting:\n\n${ParseResponse(results[1][0], maxFilenameLength)}`
    content += `# Stopped:\n\n${ParseResponse(results[2][0], maxFilenameLength)}`

    return bot.ReplyMessage(msg, content.trim())
}

function ParseResponse (resp, maxFilenameLength) {
    let content = ''
    for (const metadata of resp) {
        const title = metadata.bittorrent?.info?.name ?? metadata.files[0].path
        const totalPercentage = metadata.totalLength === '0' ? 0 : parseFloat(metadata.completedLength) / parseFloat(metadata.totalLength)
        const downloadSpeed = FormatFileSize(parseInt(metadata.downloadSpeed))

        content += `┣━ ${title}:\n`
        content += `┣━━ Status: ${metadata.status}\n`
        content += `┣━━ Progress: ${totalPercentage.toFixed(2)}% (${downloadSpeed}/s)\n`
        content += `┣━━ Files:\n`

        const sortedFiles = metadata.files.sort((x, y) => {
            const progress1 = parseFloat(x.completedLength) / parseFloat(x.length)
            const progress2 = parseFloat(y.completedLength) / parseFloat(y.length)
            return progress2 - progress1
        })

        let hasActiveFiles = false
        for (const file of sortedFiles) {
            if (!file.selected) {
                continue
            }

            const filename = file.path.split('/').at(-1)
            const filePercentage = file.length === '0' ? 0 : parseFloat(file.completedLength) / parseFloat(file.length)
            content += `┣━━━ [${filePercentage.toFixed(2)}%] ${Truncate(filename, maxFilenameLength)}\n`
            hasActiveFiles = true
        }

        if (hasActiveFiles) {
            content += '\n'
        }
    }

    return content
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'Aria2.Enabled',
    matches: [
        /^\/aria2ls/
    ],
    descriptions: ['aria2ls - List aria2 active donwloads'],
    handler
}