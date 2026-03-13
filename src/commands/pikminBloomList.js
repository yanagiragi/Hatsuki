const { ChunkArray } = require('../utils')
const { SendOptions } = require('./pikminBloomInteractive')
const {
    CONSTANT_NONE,
    ParseEntry,
    ListEntry,
} = require('../Plugins/Pikmin')

const callbackPrefix = '/pkmlist'

async function handler (query, match, config, bot) {
    const msg = query.message
    const data = query.data
    if (!data.startsWith(callbackPrefix)) {
        return
    }

    const command = query.data.replace(`${callbackPrefix} `, '')
    const entry = ParseEntry(command)

    console.log(`[PKMLIST] command = [${command}], entry = ${JSON.stringify(entry)}`)

    if (!entry.decorType) {
        await SendOptions(bot, msg, 'decor', callbackPrefix, 'New Pikmin')
    }
    else {
        await ListEntry(bot, msg, query.from.id, {
            decorType: entry.decorType,
            pikminType: CONSTANT_NONE,
            pikminTypeMisc: CONSTANT_NONE,
            acquireType: CONSTANT_NONE,
            misc: CONSTANT_NONE
        }, true)
    }

    // Always answer callback to remove "loading" animation
    return bot.AnswerCallbackQuery(query.id)
}

module.exports = {
    isAdminCommand: false,
    event: "callback_query",
    enableConfig: 'PikminBloom.Enabled',
    descriptions: ['pkmlist - list pikmin bloom entry'],
    handler,
    SendOptions
}
