const { HandleShortcut, PreprocessShortcutMessage } = require('./imageShortcutUtils')

async function handler (msg, match, config, bot) {
    if (!config['ImageShortcut.Enabled']) {
        return
    }

    const OnlySupportPost = true // hard-coded config

    const isReply = msg?.reply_to_message != null
    const repliedMessage = msg?.reply_to_message
    const checkMsg = (!OnlySupportPost && isReply) ? repliedMessage : msg

    if (!checkMsg.photo && !checkMsg?.document?.mime_type?.startsWith('image')) {
        return
    }

    const fileId = checkMsg?.document?.file_id ?? checkMsg.photo[checkMsg.photo.length - 1].file_id
    const base64String = await bot.GetBase64(fileId)

    if (checkMsg.caption != null && checkMsg.caption.length > 0) {
        console.log(`Detect caption [${checkMsg.caption}]. Try match with imageShortcut`)
        await HandleShortcut(msg, PreprocessShortcutMessage(checkMsg.caption), config, bot)
    }

    if (base64String) {
        await HandleShortcut(msg, `base64://${base64String}`, config, bot)
    }
}

module.exports = {
    isAdminCommand: false,
    event: 'message',
    matches: [],
    handler
}
