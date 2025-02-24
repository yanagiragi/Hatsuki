const TelegramBot = require('node-telegram-bot-api')

class Bot {
    constructor(token) {
        this.bot = new TelegramBot(token, { polling: true })
        this.blackboard = {}

        this.bot.on('polling_error', (error) => {
            console.trace(`[polling_error] ${error.code}: ${error.message}`)
        })
    }

    on (event, listener) {
        return this.bot.on(event, listener)
    }

    onText (regExp, callback) {
        return this.bot.onText(regExp, callback)
    }

    SendMessage (msg, content, option) {
        try {
            return this.bot.sendMessage(msg.chat.id, content, option)
        }
        catch (err) {
            console.trace(`SendMessage: ${err}`)
        }
    }

    ReplyMessage (msg, content, option) {
        try {
            return this.bot.sendMessage(msg.chat.id, content, { reply_to_message_id: msg.message_id, ...option })
        }
        catch (err) {
            console.trace(`ReplyMessage: ${err}`)
        }
    }

    SendPhoto (msg, fileId, caption = null) {
        try {
            return this.bot.sendPhoto(msg.chat.id, fileId, { caption })
        }
        catch (err) {
            console.trace(`SendPhoto: ${err}`)
        }
    }

    ReplyPhoto (msg, fileId, caption = null, fileOptions = {}) {
        try {
            return this.bot.sendPhoto(msg.chat.id, fileId, { reply_to_message_id: msg.message_id, caption }, fileOptions)
        }
        catch (err) {
            console.trace(`ReplyPhoto: ${err}`)
        }
    }

    SendSticker (msg, fileId) {
        try {
            return this.bot.sendSticker(msg.chat.id, fileId)
        }
        catch (err) {
            console.trace(`SendSticker: ${err}`)
        }
    }

    ReplySticker (msg, fileId) {
        try {
            return this.bot.sendSticker(msg.chat.id, fileId, { reply_to_message_id: msg.message_id })
        }
        catch (err) {
            console.trace(`ReplySticker: ${err}`)
        }
    }

    /**
    * Wrapper of sendMediaGroup
    * @param {*} msg telegram native passed object
    * @param {*} photos photo metadata with { file_id, caption } format
    * @returns awaitable sendMediaGroup calls
    */
    SendMediaGroup (msg, photos) {
        try {
            const media = photos.map(x => ({
                type: 'photo',
                media: x.file_id,
                caption: x.caption
            }))
            return this.bot.sendMediaGroup(msg.chat.id, media)
        }
        catch (err) {
            console.trace(`SendMediaGroup: ${err}`)
        }
    }

    /**
    * Wrapper of sendMediaGroup
    * @param {*} msg telegram native passed object
    * @param {*} photos photo metadata with { file_id, caption } format
    * @returns awaitable sendMediaGroup calls
    */
    ReplyMediaGroup (msg, photos) {
        try {
            const media = photos.map(x => ({
                type: 'photo',
                media: x.file_id,
                caption: x.caption
            }))
            return this.bot.sendMediaGroup(msg.chat.id, media, { reply_to_message_id: msg.message_id })
        }
        catch (err) {
            console.trace(`ReplyMediaGroup: ${err}`)
        }
    }

    ReplyAnimation (msg, fileId) {
        try {
            return this.bot.sendAnimation(msg.chat.id, fileId, { reply_to_message_id: msg.message_id })
        }
        catch (err) {
            console.trace(`ReplyAnimation: ${err}`)
        }
    }

    SendAnimation (msg, fileId) {
        try {
            return this.bot.sendAnimation(msg.chat.id, fileId)
        }
        catch (err) {
            console.trace(`SendAnimation: ${err}`)
        }
    }

    async GetBase64 (fileId) {
        try {
            const link = await this.bot.getFileLink(fileId)
            const response = await fetch(link)
            const arrayBuffer = await response.arrayBuffer()
            const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
            return base64String.substring(0, 256) + base64String.substring(base64String.length - 256, base64String.length)
        } catch (err) {
            console.trace(`Detect error when convert ${fileId} to base64, Raw err = ${err.message}`)
            return null
        }
    }

    SetBlackboard (key, value) {
        this.blackboard[key] = value
    }

    GetBlackboard (key) {
        return this.blackboard[key]
    }
}

module.exports = Bot
