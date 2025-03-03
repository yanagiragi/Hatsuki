const csv = require('csv-parse/sync')
const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '/data.csv')
const dataContent = fs.readFileSync(dataPath)
const data = csv.parse(dataContent)

function GetImage (message) {
    const firstMatch = data.find(x => x[2] === message)
    if (!firstMatch) {
        return null
    }

    const [episode, frame, _] = firstMatch
    return `https://cdn.anon-tokyo.com/thumb/thumb/${episode}__${frame}.jpg`
}

module.exports = GetImage
