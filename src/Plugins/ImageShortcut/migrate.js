const fs = require('fs')

const data = JSON.parse(fs.readFileSync('data.json'))

const result = []

for (const d of data) {
    const { chatId, shortcut, value, type } = d
    const idx = result.findIndex(x => x.shortcut == shortcut)
    if (idx >= 0) {
        result[idx].values.push({
            value,
            type,
            chatId
        })
    }
    else {
        result.push({
            shortcut,
            values: [
                {
                    value,
                    type,
                    chatId
                }
            ]
        })
    }
}

fs.writeFileSync('data-new.json', JSON.stringify(result, null, 4))
