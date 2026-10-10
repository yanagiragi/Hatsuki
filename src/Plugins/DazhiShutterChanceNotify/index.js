const { RequestAsync } = require('../../utils')
const fs = require('fs')
const path = require('path')

const REQUEST_TIMEOUT_MS = 30_000

const dataPath = path.join(__dirname, '/data.json')
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {}

async function GetMetadata (url, token) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
        const option = {
            url,
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`
            },
            signal: controller.signal
        }
        const content = await RequestAsync(option)
        return JSON.parse(content)
    }
    finally {
        clearTimeout(timeout)
    }
}

async function CheckHasChance (url, token) {
    const metadata = await GetMetadata(url, token)
    const hasChance = parseFloat(metadata?.advice?.recommendation) != 'low-opportunity'
    const needUpdate = hasChance && data?.metadata?.advice?.date != metadata?.advice?.date
    if (needUpdate) {
        data.metadata = metadata
        fs.writeFileSync(dataPath, JSON.stringify(data))
    }

    return { hasChance, metadata, needUpdate }
}

module.exports = { GetMetadata, CheckHasChance }
