const fetch = require('node-fetch')

const DOWNLOADING = 1
const COMPLETED = 2

async function handler (msg, match, config, bot) {
    const host = config['YtDL_List.Url']
    if (!host) {
        return bot.ReplyMessage(msg, 'Yt-dlp host is not defined')
    }

    const resp = await fetch(`http://${host}/api/v1/running`)
    const metadata = await resp.json()

    const content = metadata.reduce((acc, ele, idx) => {
        const status = ele.progress.process_status
        const postfix = status === COMPLETED
            ? 'Completed'
            : status === DOWNLOADING
                ? `${ele.progress.percentage}`
                : 'Unknown'
        const index = `${(idx + 1)}`.padStart(2, '0')
        const title = ele.info.title
            .replace(/\[/, '<')
            .replace(/\]/, '>')
        return `${acc}\n${index}. [${title}](${ele.info.url}) - ${postfix}`
    }, 'Download List of yt-dlp:\n')

    return bot.ReplyMessage(msg, content, { parse_mode: 'Markdown', link_preview_options: JSON.stringify({ is_disabled: true }) })
}

module.exports = {
    isAdminCommand: true,
    enableConfig: 'YtDL_List.Enabled',
    matches: [
        /^\/ytdlls/
    ],
    descriptions: ['ytdlls - List current download youtube video jobs'],
    handler
}
