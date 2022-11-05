const { RequestAsync, ParseDOM } = require('../../utils')

async function SearchMelonbooks (title) {
    try {
        const query = encodeURIComponent(title)
        const uri = `https://www.melonbooks.co.jp/search/search.php?mode=search&search_disp=&category_id=0&text_type=&text_type=all&name=${query}`
        const result = await RequestAsync(uri)
        const $ = ParseDOM(result)

        const blocks = $('.product')
        let searchResult = null

        if (blocks.length > 0) {
            const firstBlock = blocks[0]
            const title = $('p.title a', firstBlock).attr('title')
            const href = 'https://www.melonbooks.co.jp' + $('p.title a', firstBlock).attr('href')
            const rawPrice = $('p.price em', firstBlock).text()
            const price = ParsePrice(rawPrice)
            const stat = $('p.stock', firstBlock).text()

            searchResult = { title, href, price, stat }
        }

        return searchResult
    }
    catch (err) {
        return null
    }
}

function ParsePrice (rawPrice, includeTax = false) {
    const isNumber = function (obj) {
        return typeof obj === 'number' && isFinite(obj)
    }

    // convert '1,430円（＋税）' to '1430'
    const priceDigit = rawPrice.trim().split('').filter(x => isNumber(parseInt(x))).join('')

    const tax = includeTax ? 0.08 : 0
    return parseInt(parseInt(priceDigit) * (1 + tax))
}

async function SearchToranoana (title) {
    try {
        const query = encodeURIComponent(title)
        const uri = `https://ec.toranoana.jp/tora_r/ec/app/catalog/list/?searchDisplay=0&searchBackorderFlg=1&searchWord=${query}`
        const result = await RequestAsync(uri)
        const $ = ParseDOM(result)

        const blocks = $('.list__item')
        let searchResult = null

        if (blocks.length > 0) {
            const firstBlock = blocks[0]
            const title = $('.product_img img', firstBlock).attr('alt')
            const href = 'https://ec.toranoana.jp' + $('.product_img a', firstBlock).attr('href')
            const stat = $('.stock_sufficient', firstBlock).text()
            const rawPrice = $('.product_price', firstBlock).text().trim()
            const price = ParsePrice(rawPrice, true)

            searchResult = { title, href, price, stat }
        }

        return searchResult
    }
    catch (err) {
        return null
    }
}

async function SearchMandarake (title) {
    try {
        const query = encodeURIComponent(title)
        const uri = `https://order.mandarake.co.jp/order/listPage/list?keyword=${query}`
        const result = await RequestAsync(uri)
        const $ = ParseDOM(result)

        const blocks = $('.thumlarge .block')
        let searchResult = null

        if (blocks.length > 0) {
            const firstBlock = blocks[0]
            const title = $('.title a', firstBlock).text().trim()
            const href = 'https://order.mandarake.co.jp/order/detailPage/item?itemCode=' + $('.title a', firstBlock).attr('id').trim()
            const rawPrice = $('.price', firstBlock).text()
            const price = ParsePrice(rawPrice, true)
            let stat = $('.basic .stock', firstBlock).text()
            if (stat === '') {
                stat = '売り切れ'
            }

            searchResult = { title, href, price, stat }
        }

        return searchResult
    }
    catch (err) {
        return null
    }
}

module.exports.SearchToranoana = SearchToranoana
module.exports.SearchMelonbooks = SearchMelonbooks
module.exports.SearchMandarake = SearchMandarake
