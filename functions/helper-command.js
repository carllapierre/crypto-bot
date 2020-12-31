const priceHelper = require('../functions/helper-price')
const Discord = require('discord.js')


exports.getOption = (args, index) => {
    return (args.length > index?args[index]:'').toLowerCase()
}

exports.notYetImplemented = (message) => {
    let embed = new Discord.RichEmbed()
    embed.setColor("RED");
    embed.setDescription(`:construction: Not implemented yet. Sorry.`);      
    message.channel.send(embed);   
}
exports.alert = (message, msg) => {
    let embed = new Discord.RichEmbed()
    embed.setColor("RED");
    embed.setDescription(`:rotating_light: ${msg}`);      
    message.channel.send(embed);   
}

exports.alertCoin = (message, response, symbol, currency) => {
    //https://bin.bnbstatic.com/static/images/home/coin-logo/BNB.png
    
    let price = priceHelper.getFormattedPrice(response.lastPrice) 
    let change24h = response.priceChangePercent
    let high24h = priceHelper.getFormattedPrice(response.highPrice)
    let low24h = priceHelper.getFormattedPrice(response.lowPrice)
    let volume = priceHelper.getFormattedPrice(response.volume)
    let color = (change24h >= 0)? "GREEN" : "RED"

    let embed = new Discord.RichEmbed()
    embed.setColor(color);
    embed.addField("Change 24h", (change24h > 0?"+":"") + Number.parseFloat(change24h).toFixed(2) + "%", true) 
    embed.addField("24h High",high24h, true)
    embed.addField("24h Low" ,low24h, true) 
    embed.addField("Volume" ,Number.parseFloat(volume).toFixed(2), true) 
    embed.setFooter(`Powered by Canada Crypto!`)
    embed.attachFile(`./content/coin-images/${symbol.toLowerCase()}.png`)
    embed.setAuthor(`${symbol} Price: ${price} ${currency}`, `attachment://${symbol.toLowerCase()}.png`)
    message.channel.send(embed);   
}

exports.embedMessage = (message, text) => {
    let embed = new Discord.RichEmbed()
    embed.setColor("BLUE");
    for (i = 0; i < text.length; i++) {
        embed.setDescription(text[i]);      
    }   
    message.channel.send(embed);   
}

