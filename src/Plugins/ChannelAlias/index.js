const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '/data.json')

const data = fs.existsSync(dataPath)
    ? JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    : {}

function GetChannelAlias (chatId) {
    if (chatId in data) {
        return data[chatId]
    }
    return chatId
}

function SetChannelAlias (chatId, target) {
    if (chatId in data) {
        return false
    }
    data[chatId] = parseInt(target)
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))
    return true
}

module.exports = { GetChannelAlias, SetChannelAlias }
