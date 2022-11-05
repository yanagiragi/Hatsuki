const fs = require('fs')

const dataPath = __dirname + '/data.json'

const data = fs.existsSync(dataPath) 
    ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) 
    : []

async function ImageShortcut(option){

    const match = data.filter(x => x.shortcut == option.key)?.[0]
    
    if (option.mode == 'post')
    {
        if (match)
        {
            return { 
                isOK: true, 
                message: 'success', 
                result: match
            }
        }
        else {
            return { 
                isOK: false, 
                message: `no shortcut matches the key [${option.key}]` 
            }
        }
    }

    else if (option.mode == 'add')
    {
        if (match)
        {
            return { 
                isOK: false, 
                message: `Unable to set a exist key [${option.key}]` 
            }
        }

        data.push({
            "shortcut": option.key,
            "link": option.value
        })
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return { 
            isOK: true,
            message: `successfully set the key [${option.key}]` 
        }
    }

    else if (option.mode == 'edit')
    {
        if (!match)
        {
            return { 
                isOK: false, 
                message: `Unable to found a exist key [${option.key}] to edit` 
            }
        }

        match.link = option.value
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return { 
            isOK: true,
            message: `successfully edit the key [${option.key}]` 
        }
    }
    
    else if (option.mode == 'delete' || option.mode == 'remove')
    {
        if (!match)
        {
            return { 
                isOK: false, 
                message: `Unable to found a exist key [${option.key}] to delete` 
            }
        }

        const indexToRemove = data.indexOf(match);
        if (indexToRemove !== -1) {
            data.splice(indexToRemove, 1);
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return { 
            isOK: true,
            message: `successfully remove the key [${option.key}]` 
        }
    }

    return { 
        isOK: false, 
        message: `Unable to detect mode of ${JSON.stringify(option)}` 
    }
}

module.exports = ImageShortcut

if (require.main === module) {
    (async () => {
        let isSettingMode = false
        let arg = { mode: 'post', key: 'keqing' }
        let result = await ImageShortcut({ isSettingMode, arg })
        console.log(result)
    })()
}