const fs = require('fs')

const dataPath = __dirname + '/data.json'

async function ImageShortcut(option){
    const data = fs.existsSync(dataPath) 
        ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) 
        : []
    const { isSettingMode, arg } = option
    const { key, value } = arg

    if (isSettingMode) {
        if (data.filter(x => x.shortcut == key).length > 0)
        {
            return { isOK: false, message: `Unable to set a exist key [${key}]` }
        }

        data.push({
            "shortcut": key,
            "link": value
        })

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return { isOK: true, message: `successfully set the key [${key}]` }
    }

    const matches = data.filter(x => x.shortcut == key)
    if (matches.length > 0)
    {
        return { isOK: true, message: 'success', result: matches[0] }
    }

    return { isOK: false, message: `no shortcut matches the key [${key}]` }
}

module.exports = ImageShortcut

if (require.main === module) {
    (async () => {
        let isSettingMode = false
        let arg = { key: 'keqing' }
        let result = await ImageShortcut({ isSettingMode, arg })
        console.log(result)
    })()
}