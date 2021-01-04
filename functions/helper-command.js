const priceHelper = require('../functions/helper-price')
const Discord = require('discord.js')
const fs = require('fs')
const { isContext } = require('vm')
const iconPath = './content/coin-images/'

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

exports.sendHelp = (message, commandObj) => {
    let embed = new Discord.RichEmbed()
    embed.setTitle(':desktop: Command Helper');
    embed.setColor("BLUE");
    let commandHead = process.env.BOT_PREFIX + commandObj.commandName
    for (i = 0; i < commandObj.options.length; i++) { 
        
        option = commandObj.options[i];
        if(option.hide)
            continue;
        
        alias =  option.aliases[0];
        if(alias == '')
        {
            embed.addField(`${commandHead} ${option.params}`, option.description);      
        }else
            embed.addField(`${commandHead} ${commandObj.optPrefix + option.aliases[0]} ${option.params}`, option.description);
    }   
    message.channel.send(embed);   

}

exports.alertCoin = (message, response, symbol, currency) => {
    
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

    try{
        embed.attachFile(`./content/coin-images/${symbol.toLowerCase()}.png`)
        embed.setAuthor(`${symbol} Price: ${price} ${currency}`, `attachment://${symbol.toLowerCase()}.png`)
    }catch (err)
    {
        embed.setAuthor(`${symbol} Price: ${price} ${currency}`)
    }

    message.channel.send(embed);   
}

exports.alertNoCanDoBTC = (message) => {
    let embed = new Discord.RichEmbed()
    embed.setColor("BLUE");
    embed.setFooter(`Powered by Canada Crypto!`)
    embed.attachFile(`./content/coin-images/btc.png`)
    embed.setAuthor(`Supply is limited to 21 million dumbo!`, `attachment://btc.png`)

    message.channel.send(embed);  
}

exports.alertCoinAmount = (message, response, symbol, currency, amount) => {
    
    let price = priceHelper.getFormattedPrice(response.lastPrice) 

    let embed = new Discord.RichEmbed()
    embed.setColor("BLUE");
    embed.setFooter(`Powered by Canada Crypto!`)

    try{
        embed.attachFile(`./content/coin-images/${symbol.toLowerCase()}.png`)
        embed.setAuthor(`${amount} ${symbol} is worth ${priceHelper.getFormattedPrice(price*amount)} ${currency}`, `attachment://${symbol.toLowerCase()}.png`)
    }catch (err)
    {
        embed.setAuthor(`${amount} ${symbol} is worth ${priceHelper.getFormattedPrice(price*amount)} ${currency}`)
    }

    message.channel.send(embed);   
}

exports.embedMessage = (message, text) => {
    let embed = new Discord.RichEmbed()
    embed.setColor("BLUE");
    for (i = 0; i < text.length; i++) {
        embed.addField(text[i]);      
    }   
    message.channel.send(embed);   
}

exports.alertCandidates = (message, results) => {
    let embed = new Discord.RichEmbed()

    embed.setFooter(`Powered by Canada Crypto!`)

    if (results.length === 0) {
        embed.setColor("RED");
        embed.setTitle("Couldnd't find any candidates :frowning:")
    }
    else{
        embed.setTitle("Pump and Dump Candidates")
        embed.setColor("BLUE");

        var count = 0;
        results.forEach(candidate => {
            if(count <25){
                embed.addField(`${count + 1}. ${candidate.name} (${candidate.symbol})`, `Market cap: ${candidate.cap}`);
            }
            count++
        })
    }

    message.channel.send(embed);   
}

const iconExists = (symbol) => {
    try {
        return fs.existsSync(`${iconPath}${symbol}.png`)  
    } catch(err) {
    console.error(err)
    }
}