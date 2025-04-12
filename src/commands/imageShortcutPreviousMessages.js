const { GetChannelAlias } = require('../Plugins/ChannelAlias')
const { HandleShortcut, PreprocessShortcutMessage } = require('./imageShortcutUtils')

const previousMessages = {}
const maxPreviousMessagesLength = 4

async function handler (msg, match, config, bot) {
    const processedMsg = PreprocessShortcutMessage(msg.text)

    // if current message is a link, don't add it into previous messages
    const blacklists = [
        'https://',
        'base64://',
        'www.'
    ]
    if (blacklists.filter(x => processedMsg.includes(x)).length > 0) {
        return
    }

    const chatId = GetChannelAlias(msg.chat.id)
    RecordPreviousMessages(chatId, processedMsg)

    let handled = false

    // normal case
    const processedMatch = processedMsg.match(/^(?!\/)(.*)$/)
    if (await HandleShortcut(msg, processedMatch?.[1], config, bot)) {
        previousMessages[chatId].length = 0
        handled = true
    }

    // case consider previous message
    for (let i = 0; i < previousMessages[chatId].length; ++i) {
        const concatedPrevMessage = previousMessages[chatId].slice(i, previousMessages[chatId].length).join('')
        const concatedPrevMessageMatch = concatedPrevMessage.match(/^(?!\/)(.*)$/)
        if (await HandleShortcut(msg, concatedPrevMessageMatch?.[1], config, bot)) {
            console.log(`concatedPrevMessage = ${concatedPrevMessage} matched. Clear previousMessages`)
            previousMessages[chatId].length = 0
            handled = true
            break
        }
        else {
            // console.log(`concatedPrevMessage = ${concatedPrevMessage} not matched.`)
        }
    }

    return handled
}

function RecordPreviousMessages (chatId, content) {
    if (!(chatId in previousMessages)) {
        previousMessages[chatId] = []
    }

    previousMessages[chatId].push(content)
    while (previousMessages[chatId].length > maxPreviousMessagesLength) {
        console.log(`shift, len = ${previousMessages[chatId].length}`)
        previousMessages[chatId].shift()
    }
}

module.exports = {
    isAdminCommand: false,
    enableConfig: 'ImageShortcut.Enabled',
    matches: [
        /^(?!\/)(.*)/
    ],
    handler,
    priority: 150
}
