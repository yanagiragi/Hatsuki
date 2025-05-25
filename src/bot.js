const TelegramBot = require('node-telegram-bot-api')

class Bot {
    constructor(token) {
        this.bot = new TelegramBot(token, {
            polling: true,
            request: {
                agentOptions: {
                    keepAlive: true,
                    family: 4 // force use IPv4, ref: https://github.com/yagop/node-telegram-bot-api/issues/1136
                }
            }
        })

        this.blackboard = {}

        this.bot.on('polling_error', (error) => {
            console.trace(`[polling_error] ${error.code}: ${error.message}`)
        })
    }

    On (event, listener) {
        return this.bot.on(event, listener)
    }

    OnText (regExp, callback) {
        return this.bot.onText(regExp, callback)
    }

    async SendMessage (msg, content, option) {
        try {
            const result = await this.bot.sendMessage(msg.chat.id, content, option)
            return result
        }
        catch (err) {
            console.trace(`SendMessage: ${err}`)
        }
    }

    async ReplyMessage (msg, content, option) {
        try {
            const result = await this.bot.sendMessage(msg.chat.id, content, { reply_to_message_id: msg.message_id, ...option })
            return result
        }
        catch (err) {
            console.trace(`ReplyMessage: ${err}`)
        }
    }

    async SendPhoto (msg, fileId, caption = null) {
        try {
            const result = await this.bot.sendPhoto(msg.chat.id, fileId, { caption })
            return result
        }
        catch (err) {
            console.trace(`SendPhoto: ${err}`)
        }
    }

    async ReplyPhoto (msg, fileId, caption = null, fileOptions = {}) {
        try {
            const result = await this.bot.sendPhoto(msg.chat.id, fileId, { reply_to_message_id: msg.message_id, caption }, fileOptions)
            return result
        }
        catch (err) {
            console.trace(`ReplyPhoto: ${err}`)
        }
    }

    async SendSticker (msg, fileId) {
        try {
            const result = await this.bot.sendSticker(msg.chat.id, fileId)
            return result
        }
        catch (err) {
            console.trace(`SendSticker: ${err}`)
        }
    }

    async ReplySticker (msg, fileId) {
        try {
            const result = await this.bot.sendSticker(msg.chat.id, fileId, { reply_to_message_id: msg.message_id })
            return result
        }
        catch (err) {
            console.trace(`ReplySticker: ${err}`)
        }
    }

    async SendMediaGroup (msg, photos) {
        try {
            const media = photos.map(x => ({
                type: 'photo',
                media: x.file_id,
                caption: x.caption
            }))
            const result = await this.bot.sendMediaGroup(msg.chat.id, media)
            return result
        }
        catch (err) {
            console.trace(`SendMediaGroup: ${err}`)
        }
    }

    async ReplyMediaGroup (msg, photos) {
        try {
            const media = photos.map(x => ({
                type: 'photo',
                media: x.file_id,
                caption: x.caption
            }))
            const result = await this.bot.sendMediaGroup(msg.chat.id, media, { reply_to_message_id: msg.message_id })
            return result
        }
        catch (err) {
            console.trace(`ReplyMediaGroup: ${err}`)
        }
    }

    async ReplyAnimation (msg, fileId) {
        try {
            const result = await this.bot.sendAnimation(msg.chat.id, fileId, { reply_to_message_id: msg.message_id })
            return result
        }
        catch (err) {
            console.trace(`ReplyAnimation: ${err}`)
        }
    }

    async SendAnimation (msg, fileId) {
        try {
            const result = await this.bot.sendAnimation(msg.chat.id, fileId)
            return result
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
        }
        catch (err) {
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
