const fs = require('fs')
const path = require('path')
const { SanitizeShortcut } = require('../../utils')

// from serser322/ave-mujica-images
const jsonPath = path.join(__dirname, '/data.json')
const jsonContent = fs.readFileSync(jsonPath)
const jsonData = JSON.parse(jsonContent)

function GetImage (message) {
    const firstMatch = jsonData.find(x => SanitizeShortcut(x.name) === SanitizeShortcut(message))
    if (firstMatch) {
        return `https://raw.githubusercontent.com/serser322/ave-mujica-images/refs/heads/main/src/assets/jpg/${encodeURIComponent(firstMatch.name)}.jpg`
    }

    return null
}

module.exports = GetImage
