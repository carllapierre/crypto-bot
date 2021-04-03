require('dotenv').config()
const Discord = require('discord.js')
const mongoose = require('./config/mongoose');
const fs = require('fs')
const tickerService = require('./services/service-tickerwatch')
const nodeCache = require( "node-cache" );
global.brain = new nodeCache();

tickerService.init(process.env.BOT_ADA, "ADA")
tickerService.init(process.env.BOT_XRP, "XRP")
tickerService.init(process.env.BOT_VET, "VET")
tickerService.init(process.env.BOT_DOT, "DOT")

// Create a Discord.Client() instance.
const client = new Discord.Client()

// open mongoose connection
mongoose.connect();

// Load all commands into the client's commands object from the /commands/ folder.
client.commands = {}
fs.readdir('./commands', (err, files) => {
    try {
        files.forEach(file => {
            var prop = require(`./commands/${file}`)
            client.commands[file.split('.')[0]] = prop
        })
    } catch (err) {
        console.log(err)
    }
})

fs.readdir('./aliases/', (err, files) => {
    try {
        files.forEach(file => {
            var prop = require(`./aliases/${file}`)
            client.commands[file.split('.')[0]] = prop
        })
    } catch (err) {
        console.log(err)
    }
})


// Load all commands into the client's events object from the /events/ folder.
client.events = {}
fs.readdir('./events', (err, files) => {
    try {
        files.forEach(file => {
            var eventName = file.split('.')[0]
            var prop = require(`./events/${file}`)

            client.events[eventName] = prop
            client.on(eventName, prop.bind(null, client))
        })
    } catch (err) {
        console.log(err)
    }
})

// Initiate the connection with Discord using the token located in the client's settings object.
client.login(process.env.BOT_TOKEN)

// Catch and report discord.js errors.
client.on('error', (err) => console.error(err))
client.on('warn', (err) => console.warn(err))
// client.on('debug', (err) => console.info(err))

// Catch and report UnhandledPromiseRejectionWarnings.
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error))