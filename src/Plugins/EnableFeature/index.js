const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, './data.json')
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {}

function HasFeatureEnabled (feature, channel) {
    return data[feature] && data[feature].includes(channel)
}

function UpdateFeature (feature, channel, isEnabled) {
    let shouldSave = false
    let result = ''
    if (isEnabled) {
        const isExist = data[feature] && data[feature].indexOf(channel) > -1
        if (isExist) {
            result = `The channel [${channel}] is already enable the feature [${feature}]. Omit the request`
        }
        else {
            if (!data[feature]) {
                data[feature] = []
            }

            data[feature].push(channel)

            result = `Add channel [${channel}] into the feature [${feature}]`
            shouldSave = true
        }
    }
    else {
        const isExist = data[feature] && data[feature].indexOf(channel) > -1
        if (!isExist) {
            result = `The channel [${channel}] does not exist in the feature [${feature}]. Omit the request`
        }
        else {
            const index = data[feature].indexOf(channel)
            data[feature].splice(index, 1) // delete the index

            result = `Remove channel [${channel}] in the feature [${feature}]`
            shouldSave = true
        }
    }

    if (shouldSave) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))
    }

    return result
}

module.exports = {
    UpdateFeature,
    HasFeatureEnabled
}
