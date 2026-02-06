const { ChunkArray } = require('../utils')
const {
    DecorTypes,
    PikminTypes,
    AcquireTypes,
    MiscTypes,
    ParseEntry,
    AddEntry,
    RemoveEntry,
    ListEntry,
    CONSTANT_OTHER,
    CONSTANT_NONE
} = require('../Plugins/Pikmin')

const callbackPrefix = '/pkmi'
const pkmCallbackPrefix = '/pkm '

const GetTypes = type => {
    if (type == 'decor') return DecorTypes
    if (type == 'pikmin') return PikminTypes
    if (type == 'acquire') return AcquireTypes
    if (type == 'misc') return MiscTypes
}

async function SendOptions (bot, msg, optionType, dataPrefix, current) {
    const types = GetTypes(optionType)
    const buttons = types.map((ele, idx) => ({
        text: ele,
        callback_data: `${dataPrefix} ${idx}`
    }))
    const option = {
        reply_markup: {
            inline_keyboard: ChunkArray(buttons, 3)
        }
    }
    return bot.ReplyMessage(msg, `Choose a ${optionType} type for ${current}`, option)
}

async function handler (query, match, config, bot) {
    const msg = query.message
    const data = query.data

    if (data.startsWith(pkmCallbackPrefix)) {
        const commandType = data.match(/^\/pkm ([a-z]*)/)?.[1]
        const command = data.replace(`/pkm ${commandType}`, '').trim()
        const entry = ParseEntry(command)

        if (commandType == 'add') {
            await AddEntry(bot, msg, query.from.id, entry)
        }

        else if (commandType == 'del') {
            await RemoveEntry(bot, msg, query.from.id, entry)
        }

        else if (commandType == 'list') {
            console.log(command, JSON.stringify(entry))
            await ListEntry(bot, msg, query.from.id, entry)
        }

        else {
            await bot.ReplyMessage(msg, `Unknown command type: ${commandType}`)
        }

        // Always answer callback to remove "loading" animation
        return bot.AnswerCallbackQuery(query.id)
    }

    else if (!data.startsWith(callbackPrefix)) {
        return
    }

    const command = query.data.replace(`${callbackPrefix} `, '')
    const entry = ParseEntry(command)
    console.log(`[PKMI] command = [${command}], entry = ${JSON.stringify(entry)}`)

    if (!entry.decorType) {
        await SendOptions(bot, msg, 'decor', callbackPrefix, 'New Pikmin')
    }

    else if (!entry.pikminType) {
        const idx = DecorTypes.indexOf(entry.decorType)
        await SendOptions(bot, msg, 'pikmin', `${callbackPrefix} ${idx}`, `${entry.decorType} Pikmin`)
    }

    else if (!entry.misc) {
        const decorTypeIdx = DecorTypes.indexOf(entry.decorType)
        const pikminTypeIdx = PikminTypes.indexOf(entry.pikminType)
        await SendOptions(bot, msg,
            'misc',
            `${callbackPrefix} ${decorTypeIdx} ${pikminTypeIdx} ${entry.pikminTypeMisc}`,
            `${entry.pikminType}${(entry.pikminTypeMisc != CONSTANT_NONE ? `-${entry.pikminTypeMisc}` : '')} ${entry.decorType} Pikmin`)
    }

    else if (!entry.acquireType) {
        const decorTypeIdx = DecorTypes.indexOf(entry.decorType)
        const pikminTypeIdx = PikminTypes.indexOf(entry.pikminType)
        await SendOptions(bot, msg,
            'acquire',
            `${callbackPrefix} ${decorTypeIdx} ${pikminTypeIdx} ${entry.pikminTypeMisc} ${entry.misc}`,
            `${entry.pikminType}${(entry.pikminTypeMisc != CONSTANT_NONE ? `-${entry.pikminTypeMisc}` : '')} ${entry.decorType} ${entry.misc} Pikmin`)
    }

    else if (entry.isValid()) {
        const getCommand = cmd => {
            const decorTypeIdx = DecorTypes.indexOf(entry.decorType)
            const pikminTypeIdx = PikminTypes.indexOf(entry.pikminType)
            const acquireTypeIdx = AcquireTypes.indexOf(entry.acquireType)
            const miscTypeIdx = MiscTypes.indexOf(entry.misc)
            const command = `${pkmCallbackPrefix}${cmd} ${decorTypeIdx} ${pikminTypeIdx} ${entry.pikminTypeMisc} ${miscTypeIdx} ${acquireTypeIdx}`

            const size = new TextEncoder().encode(command).length
            if (size > 64) {
                // reach telegram callback_data size limit
                console.log(`Detect long callback_data: ${command}, byte size = ${size}`)
            }

            return command
        }
        const option = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Add", callback_data: getCommand('add') },
                        { text: "Del", callback_data: getCommand('del') },
                        { text: "List", callback_data: getCommand('list') }
                    ]
                ]
            },
            parse_mode: 'HTML'
        }

        await bot.ReplyMessage(msg, `Proceed actions to the following pikmin bloom entry?\n<code>${entry.decorType} ${entry.pikminType} ${entry.pikminTypeMisc} ${entry.acquireType} ${entry.misc}</code>`, option)
    }

    else if (entry.pikminType == CONSTANT_OTHER && entry.pikminTypeMisc == CONSTANT_NONE) {
        const command = `${entry.decorType} ${entry.pikminType} ${entry.pikminTypeMisc} ${entry.acquireType} ${entry.misc}`
        await bot.ReplyMessage(msg, `Detect pikminTypeMisc required.\nYou may copy the command to manual add pikmin entry: \n<code>${command}</code>`, { parse_mode: 'HTML' })
    }

    else {
        await bot.ReplyMessage(msg, `Unknown error, entry = ${JSON.stringify(entry, null, 4)}`)
    }

    // Always answer callback to remove "loading" animation
    return bot.AnswerCallbackQuery(query.id)
}

module.exports = {
    isAdminCommand: false,
    event: "callback_query",
    enableConfig: 'PikminBloom.Enabled',
    descriptions: ['pkmi - Add pikmin bloom entry interactive'],
    handler,
    SendOptions
}
