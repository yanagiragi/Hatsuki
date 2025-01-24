const fs = require('fs')
const path = require('path')
const TelegramBot = require('./bot')

const configPath = path.join(__dirname, '/../config.json')
const config = JSON.parse(fs.readFileSync(configPath))
const isDev = config?.IsDev ?? true

function loadCommands (bot, commands, config) {
    for (const command of commands) {
        const { isAdminCommand, event, matches, handler } = require(`./commands/${command}.js`)
        const callback = async (msg, match) => {
            const chatId = msg.chat.id
            if (!config['Bot.ChatIdList']?.find(x => x.chatId === chatId)) {
                console.log(`Skip message from [${chatId}][${msg.chat.title}] since it is not a allowed chat`)
                return
            }

            const fromId = msg.from.id
            if ((isDev || isAdminCommand) && fromId !== config['Bot.Administrator']) {
                console.log(`Skip message from ${fromId} since it is not an administrator`)
                return
            }

            handler(msg, match, config, bot)
        }
        if (event != null) {
            bot.on(event, callback)
        }
        else {
            for (const match of matches) {
                bot.onText(match, callback)
            }
        }
    }
}

const bot = new TelegramBot(config.TelegramToken)
loadCommands(bot, [
    'start',
    'stat',
    'replyTwitter',
    'imageShortcut',
    'imageShortcutPreviousMessages',
    'avr',
    'aliasGet',
    'aliasSet',
    'getBase64',
    'idGet',
    'idSet',
    'euroIdSet',
    'messageEuropean',
    'messageImageShortcut',
    'messageRecordNewId',
    'megadl',
    'ytdl',
    'ytdlmp3',
    'aria2',
    'aria2ls'
], config)

console.log('bot is ready')
