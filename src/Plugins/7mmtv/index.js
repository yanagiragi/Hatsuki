const Lib7mm = require('./lib7mm')
const fetch7mm = new Lib7mm()

async function GetReplies (option) {
    const metadata = await fetch7mm.get(option)
    return metadata
}

function Handle (text) {
    if (text === 'live') {
        return [
            {
                title: '(ゝ∀･)⌒☆',
                href: '',
                thumbnail: 'https://i.imgur.com/fN6LWAy.jpg'
            }
        ]
    }

    else if (text === 'u' || text === '抽') {
        const option = { sortByTime: false, type: 'single' }
        return GetReplies(option)
    }

    else if (text === 'u2' || text === '排') {
        const option = { sortByTime: true, type: 'single' }
        return GetReplies(option)
    }

    else if (text === 'all' || text === '我全都要') {
        const option = { sortByTime: true, type: 'all' }
        return GetReplies(option)
    }
}

module.exports = Handle
