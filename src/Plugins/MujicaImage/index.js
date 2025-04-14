const fs = require('fs')
const path = require('path')
const { SanitizeShortcut, Sample } = require('../../utils')

// from serser322/ave-mujica-images
const jsonPath = path.join(__dirname, '/data.json')
const jsonContent = fs.readFileSync(jsonPath)
const jsonData = JSON.parse(jsonContent)

function FindJsonData (message, preprocessor) {
    const matches = jsonData.filter(x => preprocessor(x.name) === preprocessor(message))
    if (matches.length > 0) {
        const { name } = Sample(matches)
        return `https://raw.githubusercontent.com/serser322/ave-mujica-images/refs/heads/main/src/assets/jpg/${encodeURIComponent(name)}.jpg`
    }
}

function GetImage (message) {
    return FindJsonData(message, x => x) || FindJsonData(message, SanitizeShortcut)
}

module.exports = GetImage
