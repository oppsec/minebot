const mineflayer = require('mineflayer');

const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalNear } = require('mineflayer-pathfinder').goals;

const server = require('./server.json');
const client = require('./bot.json');

const bot = mineflayer.createBot({
    // Server
    host: server.info.ip, // localhost
    port: server.info.port, // ...
    version: server.info.version,

    // Account
    username: server.info.account,

    // Bot
    gamemode: client.info.mode,
    ping: client.info.ping,
    respawn: client.info.respawn,

    displayName: { toString: Function },
    keepAlive: true,
    chatLengthLimit: 100,
    checkTimeoutInterval: 60 * 1000,
});

const mcData = require('minecraft-data')(bot.version);

let p = "!";

bot.loadPlugin(pathfinder)

// process.stdout.write('\033c'); // Clear chat

bot.on('chat', function (username, message) {
    if (username === bot.username) return;
    console.log(`${username} | ${message}`)

    switch (message) {
        case `${p}search`:
            search() // Search for blocks
            break

        case `${p}dev`:
            developer() // Say bot developer
            break

        case `${p}bot`:
            botInfo() // Get bot status
            break

        case `${p}jump`: // Jump
            jump()
            break

        case `${p}stopjump`: // Stop jumping
            stopjump()
            break

        case `${p}come`:
            comeOn()
            break
    }
});

// Commands
function search(message) {
    const searchBlock = message.split(' ')[1]

    if (mcData.blocksByName[searchBlock] === undefined) {
        bot.chat(`Not found > ${searchBlock}`)
        return
    }

    const ids = [mcData.blocksByName[searchBlock].id]
    const blocks = bot.findBlocks({ matching: ids, maxDistance: 128, minCount: 1 })
    bot.chat(`Found ${blocks.length} ${searchBlock} on a 128 blocks region`)
    bot.chat(`Localization: ${blocks}`)
}

function developer() {
    bot.chat('Developer: dsm')
}

function botInfo() {
    const client = bot.entity
    bot.chat(`[!] Username: ${client.username} \n[!] Coords: ${client.position}`)
    bot.chat(`[!] Type: ${client.type} \n[!] onGround: ${client.onGround}`)
}

function jump() {
    Math.floor(bot.entity.position.y) + 1.0
    bot.setControlState('jump', true)
    bot.chat('[!] Jumping')
}

function stopjump() {
    bot.setControlState('jump', false)
    bot.chat('[!] Stop jumping')
}

function comeOn(username, message) {
    if (username == bot.username) return;
    const defaultMove = new Movements(bot, mcData)

    const target = bot.players[username] ? bot.players[username].entity : null
    if (message === '!come')
        if (!target) {
            bot.chat(`[x] - I dont can see you ${username}`)
            return
        }

    const p = target.position
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
    bot.chat('[!] Walking...')

}

function itemInfo(item) {
    if (item) {
        return `${item.name} ${item.count}`
    } else {
        return "I don't have any item"
    }
}


bot.once('spawn', () => {
    const client = bot.entity
    bot.chat('[!] - Online')
    bot.chat(`${client.position}`)
})

bot.on('login', () => {
    console.log(`Logged in | ${server.info.account} \nServer | ${server.info.ip}:${server.info.port}\n`)
})

bot.on('error', err => console.log(err))