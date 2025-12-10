const fs = require('fs')
const path = require('path')

const CONSTANT_OTHER = '其它'
const CONSTANT_NONE = 'none'

const dataPath = path.join(__dirname, '/data.json')
const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {}

const DecorTypes = [
    "餐廳",
    "咖啡廳",
    "甜點店/馬卡龍",
    "甜點店/甜甜圈",
    "電影院",
    "藥局",
    "動物園",
    "森林/鍬形蟲",
    "森林/橡栗",
    "水邊",
    "郵局",
    "美術館",
    "機場",
    "車站/電車紙模型",
    "車站/票券",
    "海灘",
    "漢堡店",
    "便利店/瓶蓋",
    "便利店/零食",
    "超市/蘑菇",
    "超市/香蕉",
    "麵包店",
    "美容院",
    "服裝店",
    "公園",
    "圖書館",
    "路邊/貼紙",
    "路邊/金幣",
    "壽司餐廳",
    "山丘",
    "體育館",
    "雨天",
    "下雪",
    "主題樂園",
    "公車站",
    "義式餐廳/披薩",
    "義式餐廳/義大利麵",
    "拉麵店",
    "橋梁",
    "飯店",
    "化妝品商店",
    "神社與寺廟/大吉",
    "神社與寺廟/吉",
    "神社與寺廟/中吉",
    "神社與寺廟/小吉",
    "神社與寺廟/末吉",
    "電器行/電池",
    "電器行/仙女燈",
    "咖哩餐廳",
    "五金行",
    "大學&學院",
    "墨西哥餐廳",
    "自助洗衣店&乾洗店",
    "韓國餐廳",
    "萬聖節糖果",
    "萬聖節燈",
    "連指手套",
    "禮物貼紙/金色",
    "麻將牌",
    "拼圖/2021年秋天",
    "三週年紀念杯子蛋糕",
    "裝飾球",
    "月餅",
    "骷髏頭",
    "四週年紀念繁花禮盒",
    "四週年紀念零食",
    "2025裝飾",
    "奶嘴",
    "金色飛機玩具",

    CONSTANT_NONE
]

const PikminTypes = [
    "紅",
    "黃",
    "藍",
    "白",
    "紫",
    "黑",
    "粉紅",
    "冰塊",
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

class PikminBloomEntry {
    constructor() {
        this.decorType = null
        this.pikminType = null
        this.pikminTypeMisc = CONSTANT_NONE
        this.acquireType = null
        this.misc = CONSTANT_NONE
    }

    isValid () {
        if (this.pikminType == CONSTANT_OTHER && this.pikminTypeMisc == CONSTANT_NONE) {
            return false
        }
        return this.decorType && this.pikminType && this.acquireType
    }
}

function ParseEntry (message) {
    const result = new PikminBloomEntry()
    const splitted = message.split(' ')
    result.decorType = splitted?.[0]
    result.pikminType = splitted?.[1]
    result.pikminTypeMisc = splitted?.[2] ?? CONSTANT_NONE
    result.acquireType = splitted?.[3]
    result.misc = splitted?.[4] ?? CONSTANT_NONE
    return result
}

function Save () {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4))
}

async function AddEntry (bot, msg, id, entry) {
    const match = data?.[id]?.find(x =>
        x.decorType == entry.decorType &&
        x.pikminType == entry.pikminType &&
        x.pikminTypeMisc == entry.pikminTypeMisc
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

async function EditEntry (bot, msg, id, entry) {
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

    matches[0].acquireType = entry.acquireType
    matches[0].misc = entry.misc

    Save()

    return bot.ReplyMessage(msg, `Update entry: acquireType = ${match.acquireType}, misc = ${match.misc}`)
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

async function ListEntry (bot, msg, id, entry) {
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

    return bot.ReplyMessage(msg, `Found entries: ${JSON.stringify(entries, null, 4)}`)
}

module.exports = {
    PikminBloomEntry,
    ParseEntry,
    DecorTypes,
    PikminTypes,
    AcquireTypes,
    AddEntry,
    EditEntry,
    RemoveEntry,
    ListEntry,
    CONSTANT_OTHER,
    CONSTANT_NONE,
}