const csv = require('csv-parse/sync')
const fs = require('fs')
const path = require('path')
const { SanitizeShortcut } = require('../../utils')

const csvPath = path.join(__dirname, '/data.csv')
const csvContent = fs.readFileSync(csvPath)
const csvData = csv.parse(csvContent)

const jsonPath = path.join(__dirname, '/all_img.json')
const jsonContent = fs.readFileSync(jsonPath)
const jsonData = JSON.parse(jsonContent)

function GetImage (message) {
    let firstMatch = csvData.find(x => SanitizeShortcut(x[2]) === SanitizeShortcut(message))
    if (firstMatch) {
        const [episode, frame, _] = firstMatch
        return `https://cdn.anon-tokyo.com/thumb/thumb/${episode}__${frame}.jpg`
    }

    firstMatch = jsonData.find(x => SanitizeShortcut(x.alt) === SanitizeShortcut(message))
    if (firstMatch) {
        return firstMatch.url
    }

    return null
}

module.exports = GetImage
