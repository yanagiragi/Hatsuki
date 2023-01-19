const { RequestAsync, ParseDOM } = require('../../utils')
const url = 'https://7mmtv.tv/zh/'

class Lib7mm {
    async getShortenUrl (targetUrl) {
        try {
            const resp = await RequestAsync({
                url: 'https://is.gd/create.php',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: `url=${encodeURIComponent(targetUrl)}&shorturl=&opt=0`,
                method: 'POST'
            })
            const $ = ParseDOM(resp)
            const url = $('#short_url').attr('value')
            return url
        }
        catch (err) {
            throw new Error(`is.gd is down. Raw = ${err}`)
        }
    }

    async getCensored (url, options) {
        const sortByTime = options.sortByTime || false
        const type = options.type || 'single'

        const resp = await RequestAsync(url)
        const $ = ParseDOM(resp)
        const blocks = $('.block')
        const censoredBlock = blocks?.[0]
        const items = $('.col-item', censoredBlock)

        const censoreds = []
        for (let i = 0; i < items.length; ++i) {
            const ele = items[i]
            const data = {
                href: $('.video-title a', ele).attr('href'),
                thumbnail: $('.video-preview img', ele).attr('src'),
                date: $('.video-info .text-muted', ele).text().trim(),
                title: $('.video-title', ele).text().replace(/\n/g, '')
            }
            censoreds.push(data)
        }

        if (sortByTime) {
            censoreds.sort((a, b) => a.date > b.date)
        }

        if (type === 'all') {
            for (let i = 0; i < censoreds.length; ++i) {
                const data = censoreds[i]
                const shortenUrl = await this.getShortenUrl(data.href)
                data.href = shortenUrl
            }
            return censoreds
        }
        else {
            const i = censoreds.length - 1
            const data = censoreds[i]
            const shortenUrl = await this.getShortenUrl(data.href)
            data.href = shortenUrl
            return [data]
        }
    }

    async get (options = {}) {
        return this.getCensored(url, options)
    }
}

module.exports = Lib7mm

if (require.main === module) {
    const Run = async () => {
        const lib = new Lib7mm()
        const result = await lib.get({ sortByTime: true, type: 'single' })
        console.log(result)
    }

    Run()
}
