const fs = require('fs')
const path = require('path')
const TelegramBot = require('./bot')

const configPath = path.join(__dirname, '/../config.json')
const config = JSON.parse(fs.readFileSync(configPath))
const isDev = config?.IsDev ?? true

function loadCommands (bot, commands, config) {
    const availableCommands = []
    for (const command of commands) {
        const { isAdminCommand, event, matches, handler, enableConfig, descriptions } = require(`./commands/${command}.js`)
        if (enableConfig && !config[enableConfig]) {
            // console.log(`Skip message from [${chatId}][${match?.[0]}] since it is not a allowed command`)
            continue
        }

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

        if (descriptions) {
            availableCommands.push({ command, descriptions })
        }
    }

    return availableCommands
}

const bot = new TelegramBot(config.TelegramToken)
const commands = loadCommands(bot, [
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

const commandsInString = [...new Set(commands.map(x => x.descriptions).flat())].reduce((acc, ele) => {
    return `${acc}\n${ele}`
}, 'lscmd - List avabilable commands').trim()
bot.onText(/\/lscmd/, async (msg) => bot.ReplyMessage(msg, commandsInString))

console.log(`bot is ready, avabilable commands =\n[\n${commandsInString.split('\n').map(x => `    ${x}`).join('\n')}\n]`)
