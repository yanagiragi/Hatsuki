const csv = require('csv-parse/sync')
const fs = require('fs')
const path = require('path')
const { SanitizeShortcut } = require('../../utils')

const dataPath = path.join(__dirname, '/data.csv')
const dataContent = fs.readFileSync(dataPath)
const data = csv.parse(dataContent)

function GetImage (message) {
    const firstMatch = data.find(x => SanitizeShortcut(x[2]) === SanitizeShortcut(message))
    if (!firstMatch) {
        return null
    }

    const [episode, frame, _] = firstMatch
    return `https://cdn.anon-tokyo.com/thumb/thumb/${episode}__${frame}.jpg`
}

module.exports = GetImage
