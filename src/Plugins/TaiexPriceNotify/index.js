const { RequestAsync } = require('../../utils')

async function GetMetadata (token) {
    const options = {
        url: 'https://api.fugle.tw/marketdata/v1.0/stock/intraday/quote/IX0001',
        headers: {
            "X-API-KEY": token
        }
    }
    const content = await RequestAsync(options)
    return JSON.parse(content)
}

async function CheckBelowTwoPercent (token) {
    const metadata = await GetMetadata(token)
    return { isBelow: metadata.changePercent <= -2.0, metadata }
}

module.exports = { GetMetadata, CheckBelowTwoPercent }