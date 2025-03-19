const fs = require('fs')
const path = require('path')
const { SanitizeShortcut } = require('../../utils')
const { stringSimilarity } = require('string-similarity-js')

const searchDir = path.join(__dirname, 'Storage')
const data = fs.existsSync(searchDir) ? Load() : []

const fileIdCachePath = path.join(__dirname, 'Storage', 'fileId.json')
const fileIdCache = fs.existsSync(fileIdCachePath) ? JSON.parse(fs.readFileSync(fileIdCachePath)) : {}

function Load () {
    const result = []
    const dirs = fs.readdirSync(searchDir)
    for (const dir of dirs) {
        const filepath = path.join(searchDir, dir, 'result.json')
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath)
            const parsed = JSON.parse(content)
            for (const entry of parsed) {
                result.push({
                    id: path.join(dir, entry.filename),
                    filepath: path.resolve(searchDir, dir, entry.filename),
                    text: entry.text
                })
            }
        }
    }
    return result
}

function GetImage (message) {
    const firstMatch = data.find(x => x.text && message && SanitizeShortcut(x.text) === SanitizeShortcut(message))
    if (!firstMatch) {
        return null
    }

    const { id, filepath, _ } = firstMatch
    return { id, filepath, fileId: fileIdCache?.[id] }
}

function SetFileId (id, fileId) {
    const isExist = (id in fileIdCache)
    if (!isExist) {
        fileIdCache[id] = fileId
    }

    fs.writeFileSync(fileIdCachePath, JSON.stringify(fileIdCache, null, 4))
}

function Search (text, takeAmount) {
    return data
        .map(x => ({
            id: x.id,
            text: x.text,
            similarity: stringSimilarity(SanitizeShortcut(x.text), SanitizeShortcut(text)).toFixed(2)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .splice(0, takeAmount)
}

module.exports = {
    Search,
    GetImage,
    SetFileId
}
