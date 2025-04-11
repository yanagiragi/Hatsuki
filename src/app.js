const fs = require('fs')
const path = require('path')
const TelegramBot = require('./bot')
const { HasFeatureEnabled } = require('./Plugins/EnableFeature')

const configPath = path.join(__dirname, '/../config.json')
const config = JSON.parse(fs.readFileSync(configPath))
const isDev = config?.IsDev ?? true

function loadCommands (bot, commands, config, whitelist) {
    const availableCommands = []
    const onCallbacks = {}
    for (const command of commands) {
        const { isAdminCommand, event, matches, handler, enableConfig, descriptions, priority } = require(`./commands/${command}.js`)
        if (enableConfig && !config[enableConfig]) {
            // console.log(`Skip message from [${chatId}][${match?.[0]}] since it is not a allowed command`)
            continue
        }

        if (!enableConfig && !whitelist.includes(command)) {
            console.error(`warning: command [${command}] has no enableConfig!`)
            continue
        }

        const callback = async (msg, match) => {
            const chatId = msg.chat.id // use original chat id for permission check
            if (!config['Bot.ChatIdList']?.find(x => x.chatId === chatId)) {
                console.log(`Skip message from [${chatId}][${msg.chat.title}] since it is not a allowed chat`)
                return
            }
            else if (enableConfig && !HasFeatureEnabled(enableConfig, chatId)) {
                console.log(`Skip message from ${chatId} since the feature [${enableConfig}] is not enabled in this channel`)
                return
            }

            const fromId = msg.from.id
            if ((isDev || isAdminCommand) && fromId !== config['Bot.Administrator']) {
                console.log(`Skip message from ${fromId} since it is not an administrator`)
                return
            }

            const result = await handler(msg, match, config, bot)
            return result
        }

        if (event != null) {
            const arg = {
                priority: priority ?? 50, // default value: 50
                callback
            }
            if (event in onCallbacks) {
                onCallbacks[event].push(arg)
            }
            else {
                onCallbacks[event] = [arg]
            }
        }
        else {
            for (const match of matches) {
                bot.OnText(match, callback)
            }
        }

        if (descriptions) {
            availableCommands.push({ command, descriptions })
        }
    }

    // Handle onEvent callbacks sorted by priority
    for (const event in onCallbacks) {
        bot.On(event, async (msg, match) => {
            const callbackPriorties = [...new Set(onCallbacks[event].map(x => x.priority))].sort().reverse()
            for (const sortedPriority of callbackPriorties) {
                let handled = false
                for (const { priority, callback } of onCallbacks[event]) {
                    if (priority !== sortedPriority) {
                        continue
                    }
                    const result = await callback(msg, match)
                    if (result) {
                        handled = true
                    }
                }

                if (handled) {
                    break
                }
            }
        })
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
    'aria2ls',
    'goImage',
    'ytdlls',
    'enableFeature',
    'disableFeature',
    'getEnabledFeature',
    'megals',
    'meowMeowImage',
    'findMeowMeowImage',
    'sendMessage',
    'ytdltext',
    'mujicaImage'
], config, ['messageRecordNewId'])

const commandsInString = [...new Set(commands.map(x => x.descriptions).flat())].reduce((acc, ele) => {
    return `${acc}\n${ele}`
}, 'lscmd - List avabilable commands').trim()
bot.OnText(/\/lscmd/, async (msg) => bot.ReplyMessage(msg, commandsInString))

console.log(`bot is ready, avabilable commands =\n[\n${commandsInString.split('\n').map(x => `    ${x}`).join('\n')}\n]`)
