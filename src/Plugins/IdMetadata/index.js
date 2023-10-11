const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '/data.json')
const data = fs.existsSync(dataPath)
    ? JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    : {}

function GetIdMetadata (alias) {
    return data?.[alias] || Object.values(data).filter(x => x == alias)?.[0]
}

function GetIdMetadatas () {
    return JSON.parse(JSON.stringify(data))
}

function SetIdMetadata (alias, id) {
    data[alias] = id
    Save()
}

function Save () {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))
}

module.exports.GetIdMetadata = GetIdMetadata
module.exports.GetIdMetadatas = GetIdMetadatas
module.exports.SetIdMetadata = SetIdMetadata
