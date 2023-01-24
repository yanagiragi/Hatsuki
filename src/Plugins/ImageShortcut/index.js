const fs = require('fs')
const path = require('path')

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
    else if (x.endsWith('.jpg') ||x.endsWith('.jpeg') || x.endsWith('.png')) {
        return 'photo'
    }
    else {
        return 'sticker'
    }
}

// Supported modes: [ post, add, edit, delete/remove, list ]
async function ImageShortcut (option) {
    const match = data.filter(x => x.shortcut === option.key)?.[0]

    if (option.mode === 'post') {
        if (match) {
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

    else if (option.mode === 'add') {
        if (match) {
            return {
                isOK: false,
                message: `Unable to set an exist key [${option.key}]`
            }
        }

        // special treat webp links
        if (option.value.endsWith('.webp')) {
            data.push({
                shortcut: option.key,
                value: option.value,
                type: 'sticker'
            })
        }
        else {
            data.push({
                shortcut: option.key,
                value: option.value,
                type: option.type
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

        match.value = option.value
        match.type = option(match.value)
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
        return {
            isOK: false,
            message: `Available options are:\n${data.reduce((acc, ele) => `${acc}\n${ele.shortcut}`, '')}`
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
