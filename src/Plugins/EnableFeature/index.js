const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, './data.json')
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {}

const AllFeatures = 'AllFeatures'

function HasFeatureEnabled (feature, channel) {
    const case1 = data[AllFeatures] && data[AllFeatures].includes(channel)
    const case2 = data[feature] && data[feature].includes(channel)
    return case1 || case2
}

function GetEnabledFeature (channel) {
    if (data[AllFeatures].includes(channel)) {
        return AllFeatures
    }
    const result = []
    for (const key in data) {
        if (data[key].includes(channel)) {
            result.push(key)
        }
    }

    return result.join(', ')
}

function UpdateFeature (feature, channel, isEnabled) {
    if (feature === AllFeatures) {
        return 'Prohibited feature. Please manually add it in the config'
    }

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
    HasFeatureEnabled,
    GetEnabledFeature
}
