const fs = require('fs')
const path = require('path')

const regexStartPattern = 'r/'

const dataPath = path.join(__dirname, '/data.json')

const data = fs.existsSync(dataPath)
    ? JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    : []

const GetType = (raw) => {
    const x = raw.toLowerCase()
    if (x.startsWith('http')) {
        return 'url'
    }
    else if (x.endsWith('.webp')) {
        return 'sticker'
    }
    else if (x.endsWith('.gif') || x.endsWith('.mp4')) {
        return 'animation'
    }
    else if (x.endsWith('.jpg') || x.endsWith('.jpeg') || x.endsWith('.png')) {
        return 'photo'
    }
    else {
        return 'sticker'
    }
}

function Match (shortcutConfig, key) {
    // don't match link with regexs
    if (key != null && (key.startsWith('https://') || key.startsWith('base64://'))) {
        return shortcutConfig.shortcut === key
    }

    if (shortcutConfig.shortcut.startsWith(regexStartPattern)) {
        const rawRegex = shortcutConfig.shortcut.substring(regexStartPattern.length)
        try {
            const regex = new RegExp(rawRegex)
            const match = key.toString().match(regex)
            const hasMatched = match !== null

            if (hasMatched) {
                console.log(`detect regex match = ${rawRegex}, key = ${key}, match = ${match?.[1]}`)
            }
            else {
                console.log(`detect regex not match = ${rawRegex}, key = ${key}, match = ${match?.[1]}`)
            }

            return hasMatched
        }
        catch (error) {
            console.error(`Invalid regex = ${rawRegex}, error = ${error}`)
            return false
        }
    }

    return PlainMatch(shortcutConfig, key)
}

function PlainMatch (shortcutConfig, key) {
    return shortcutConfig.shortcut === key
}

// Supported modes: [ post, add, edit, delete/remove, list ]
async function ImageShortcut (chatId, option) {
    const matchFunc = option.mode === 'post' ? Match : PlainMatch
    const match = data.find(x => matchFunc(x, option.key))
    const result = match?.values?.filter(x => x.chatId === chatId)

    if (option.mode === 'post') {
        if (match) {
            return {
                isOK: true,
                message: 'success',
                result
            }
        }
        else {
            return {
                isOK: false,
                message: `no shortcut matches the key [${option.key}]`
            }
        }
    }

    else if (option.mode === 'add') {
        /*if (match && result && result.length > 0) {
            return {
                isOK: false,
                message: `Unable to set an exist key [${option.key}]`
            }
        }*/

        // special treat webp links
        const entry = {
            chatId,
            value: option.value,
            type: option.value.endsWith('.webp') ? 'sticker' : option.type
        }
        if (match) {
            match.values.push(entry)
        }
        else {
            data.push({
                shortcut: option.key,
                values: [entry]
            })
        }

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return {
            isOK: true,
            message: `successfully set the key [${option.key}]`
        }
    }

    else if (option.mode === 'edit') {
        if (!match) {
            return {
                isOK: false,
                message: `Unable to found an exist key [${option.key}] to edit`
            }
        }

        if (match.values.length > 1) {
            return {
                isOK: false,
                message: `Unable to edit exist key [${option.key}] that has multiple images`
            }
        }

        match.values[0].value = option.value
        match.values[0].type = option(match.value)
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return {
            isOK: true,
            message: `successfully edit the key [${option.key}]`
        }
    }

    else if (option.mode === 'delete' || option.mode === 'remove') {
        if (!match) {
            return {
                isOK: false,
                message: `Unable to found an exist key [${option.key}] to delete`
            }
        }

        if (match.values.length > 1) {
            return {
                isOK: false,
                message: `Unable to delete exist key [${option.key}] that has multiple images`
            }
        }

        const indexToRemove = data.indexOf(match)
        if (indexToRemove !== -1) {
            data.splice(indexToRemove, 1)
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))

        return {
            isOK: true,
            message: `successfully remove the key [${option.key}]`
        }
    }

    else if (option.mode === 'list') {
        const shortcuts = data
            .map(x => ({
                shortcut: x.shortcut,
                values: x.values.filter(y => y.chatId === chatId)
            }))
            .filter(x => x.values.length > 0)
            .map(x => x.shortcut)
            .sort()
        return {
            isOK: false,
            message: `Available options are:\n${JSON.stringify(shortcuts, null, 4)}`,
            raw: shortcuts
        }
    }

    else {
        return {
            isOK: false,
            message: `Unable to detect mode of ${JSON.stringify(option)}`
        }
    }
}

module.exports = ImageShortcut

if (require.main === module) {
    (async () => {
        const isSettingMode = false
        const arg = { mode: 'post', key: 'keqing' }
        const result = await ImageShortcut({ isSettingMode, arg })
        console.log(result)
    })()
}
