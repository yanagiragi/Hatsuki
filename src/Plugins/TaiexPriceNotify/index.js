const { RequestAsync } = require('../../utils')
const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '/data.json')
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {}

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
    const isBelow = parseFloat(metadata.changePercent) <= -2.0
    const needUpdate = isBelow && data.metadata?.date != metadata.date
    if (needUpdate) {
        data.metadata = metadata
        fs.writeFileSync(dataPath, JSON.stringify(data))
    }

    return { isBelow, metadata, needUpdate }
}

module.exports = { GetMetadata, CheckBelowTwoPercent }