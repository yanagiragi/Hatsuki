const csv = require('csv-parse/sync')
const fs = require('fs')
const path = require('path')
const { SanitizeShortcut, Sample } = require('../../utils')

const jsonPath = path.join(__dirname, '/all_img.json')
const jsonContent = fs.readFileSync(jsonPath)
const jsonData = JSON.parse(jsonContent)

function FindJsonData (message) {
    const matches = jsonData.filter(x => x.alt === message)
    if (matches.length > 0) {
        return Sample(matches).url
    }
}

function GetImage (message) {
    return FindJsonData(message, x => x) || FindJsonData(message, SanitizeShortcut)
}

module.exports = GetImage
