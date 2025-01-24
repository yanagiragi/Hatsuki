async function handler (msg, match, config, bot) {
    const isReply = msg?.reply_to_message != null
    const repliedMessage = msg?.reply_to_message
    const checkMsg = isReply ? repliedMessage : msg

    if (!isReply) {
        return bot.ReplyMessage(msg, 'This command can only used in reply mode.')
    }

    if (!checkMsg.photo && !checkMsg?.document?.mime_type?.startsWith('image')) {
        return
    }

    const fileId = checkMsg?.document?.file_id ?? checkMsg.photo[checkMsg.photo.length - 1].file_id
    const base64String = await bot.GetBase64(fileId)

    // reply a hard-coded sticker for now
    await bot.ReplySticker(msg, 'CAACAgUAAxkBAAIuDGSNf9Fv48q6fK5ocLK6VIZjuBL1AAIJAQACaCScIHq23TgvlRnMLwQ')

    return bot.ReplyMessage(msg, `base64://${base64String}`)
}

module.exports = {
    isAdminCommand: true,
    matches: [
        /^\/getbase64/
    ],
    descriptions: ['getbase64 - Get base64 of an image'],
    handler
}
