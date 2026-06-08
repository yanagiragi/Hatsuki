const fs = require('fs')
const path = require('path')
const { markdownTable } = require('markdown-table')

const CONSTANT_OTHER = '其它'
const CONSTANT_NONE = 'none'

const dataPath = path.join(__dirname, '/data.json')
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {}

const decorTypePath = path.join(__dirname, '/decorType.json')
let rawDecor = fs.existsSync(decorTypePath) ? JSON.parse(fs.readFileSync(decorTypePath)) : []
let DecorTypes = [...rawDecor, CONSTANT_NONE]

const PikminTypes = [
    "紅",
    "黃",
    "藍",
    "白",
    "紫",
    "黑",
    "粉",
    "冰",
    CONSTANT_OTHER,
    CONSTANT_NONE
]

const AcquireTypes = [
    "未取得",
    "已取得花苗",
    "已孵化",
    "已取得飾品",
    CONSTANT_NONE
]

const MiscTypes = [
    "海外",
    CONSTANT_NONE
]

class PikminBloomEntry {
    constructor() {
        this.decorType = null
        this.pikminType = null
        this.pikminTypeMisc = CONSTANT_NONE
        this.acquireType = null
        this.misc = null
    }

    isValid () {
        if (this.pikminType == CONSTANT_OTHER && this.pikminTypeMisc == CONSTANT_NONE) {
            return false
        }
        return this.decorType && this.pikminType && this.acquireType && this.misc
    }
}

function ParseEntry (message) {
    const result = new PikminBloomEntry()
    const splitted = message.split(' ')
    result.decorType = DecorTypes?.[splitted?.[0]] ?? splitted?.[0]
    result.pikminType = PikminTypes?.[splitted?.[1]] ?? splitted?.[1]
    result.pikminTypeMisc = splitted?.[2] ?? CONSTANT_NONE
    result.misc = MiscTypes?.[splitted?.[3]] ?? splitted?.[3]
    result.acquireType = AcquireTypes?.[splitted?.[4]] ?? splitted?.[4]
    return result
}

function Save () {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))
}

async function AddEntry (bot, msg, id, entry) {
    const match = data?.[id]?.find(x =>
        x.decorType == entry.decorType &&
        x.pikminType == entry.pikminType &&
        x.pikminTypeMisc == entry.pikminTypeMisc &&
        x.acquireType == entry.acquireType &&
        x.misc == entry.misc
    )

    if (match) {
        return bot.ReplyMessage(msg, `Already exist entry. Skipped`)
    }

    if (!data[id]) {
        data[id] = [entry]
    }
    else {
        data[id].push(entry)
    }

    Save()

    return bot.ReplyMessage(msg, `Add new entry: ${JSON.stringify(entry, null, 4)}`)
}

async function RemoveEntry (bot, msg, id, entry) {
    const filterFunc = x =>
        x.decorType == entry.decorType &&
        x.pikminType == entry.pikminType &&
        x.pikminTypeMisc == entry.pikminTypeMisc &&
        x.acquireType == entry.acquireType &&
        x.misc == entry.misc

    const matches = data?.[id]?.filter(filterFunc)
    if (matches.length > 1) {
        return bot.ReplyMessage(msg, `Multiple match exists. Skipped`)
    }

    const matchIndex = data?.[id]?.findIndex(filterFunc)
    if (matchIndex < 0) {
        console.log(matches, matchIndex)
        return bot.ReplyMessage(msg, `No exist entry. Skipped`)
    }

    data[id].splice(matchIndex, 1)

    Save()

    return bot.ReplyMessage(msg, `Remove entry: ${JSON.stringify(entry, null, 4)}`)
}

async function ListEntry (bot, msg, id, entry, outputAsTable) {
    let entries = data?.[id]

    const listAll = (entry.decorType == null || entry.decorType == CONSTANT_NONE) &&
        (entry.pikminType == null || entry.pikminType == CONSTANT_NONE) &&
        (entry.acquireType == null || entry.acquireType == CONSTANT_NONE)
    if (listAll) {
        return bot.ReplyMessage(msg, `All entries: ${JSON.stringify(entries, null, 4)}`)
    }

    if (entry.decorType && entry.decorType != CONSTANT_NONE) {
        console.log(`filter by decorType = ${entry.decorType}`)
        entries = entries.filter(x => x.decorType == entry.decorType)
    }

    if (entry.pikminType && entry.pikminType != CONSTANT_NONE) {
        console.log(`filter by pikminType = ${entry.pikminType}`)
        entries = entries.filter(x => x.pikminType == entry.pikminType)
    }

    if (entry.pikminType == CONSTANT_OTHER && entry.pikminTypeMisc != CONSTANT_NONE) {
        console.log(`filter by pikminTypeMisc = ${entry.decorType}`)
        entries = entries.filter(x => x.pikminTypeMisc == pikminTypeMiscentry.pikminTypeMisc)
    }

    if (entry.acquireType && entry.acquireType != CONSTANT_NONE) {
        console.log(`filter by acquireType = ${entry.acquireType}`)
        entries = entries.filter(x => x.acquireType == entry.acquireType)
    }

    if (entry.misc != CONSTANT_NONE) {
        console.log(`filter by misc = ${entry.misc}`)
        entries = entries.filter(x => x.misc == entry.misc)
    }

    // sort by decorType
    entries.sort((x, y) => x.decorType.localeCompare(y.decorType))

    if (outputAsTable) {
        const tableData = entries.map(x => [x.decorType, (x.pikminType == CONSTANT_OTHER ? `${x.pikminType}-${x.pikminTypeMisc}` : x.pikminType), x.acquireType, x.misc])
        const option = { parse_mode: 'Markdown' }
        const output = markdownTable([['飾品', '皮克敏', '狀態', '地點']].concat(tableData))
        return bot.ReplyMessage(msg, `Found entries: \`\`\`\n${output}\`\`\``, option)
    }
    else {
        return bot.ReplyMessage(msg, `Found entries: ${JSON.stringify(entries, null, 4)}`)
    }
}

async function AddDecorType (bot, msg, type) {
    if (DecorTypes.includes(type)) {
        return bot.ReplyMessage(msg, `Already exist decor type. Skipped`)
    }

    rawDecor.push(type)
    fs.writeFileSync(decorTypePath, JSON.stringify(rawDecor, null, 4))

    rawDecor = JSON.parse(fs.readFileSync(decorTypePath))
    DecorTypes = [...rawDecor, CONSTANT_NONE]

    return bot.ReplyMessage(msg, `Add new decor type: ${type}`)
}

function GetDecorTypes () {
    return DecorTypes
}

module.exports = {
    PikminBloomEntry,
    ParseEntry,
    GetDecorTypes,
    PikminTypes,
    AcquireTypes,
    MiscTypes,
    AddEntry,
    RemoveEntry,
    ListEntry,
    CONSTANT_OTHER,
    CONSTANT_NONE,
    AddDecorType,
}