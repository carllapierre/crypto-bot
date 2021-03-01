const priceHelper = require('../functions/helper-price')
const symbolHelper = require('../functions/helper-symbol')
const Discord = require('discord.js')
const fs = require('fs')
const { isContext } = require('vm')
const iconPath = './content/coin-images/'
const URL_COINMARKET = `https://coinmarketcap.com/currencies/`;

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
exports.alertPool = (message) => {
    let embed = new Discord.RichEmbed()
    embed.setColor("BLUE");
    embed.setDescription(`Hey you! Yeah you! Do you have some ADA laying around? Did you know you can stake your ADA without locking it? It won't cost you anything and you will get rewarded by doing so! If you're interested, Crypto Canada is running its very own high availability pool managed by IT professionals and DeFi enthusiasts! Check out the following links for more information. Stake Pool: [[CADA]](https://cadapool.com/) More Info on Staking: [Cardano Website](https://cardano.org/calculator/?calculator=delegator)`);
    embed.attachFile(`./content/coin-images/ada.png`)
    embed.setAuthor(`[CADA] Stake Pool`, `attachment://ada.png`)
    embed.setFooter(`Powered by Canada Crypto!`)
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

    if(iconExists(symbol)){
        embed.attachFile(`./content/coin-images/${symbol.toLowerCase()}.png`)
        embed.setAuthor(`${symbol} Price: ${price} ${currency}`, `attachment://${symbol.toLowerCase()}.png`)
    }else
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

    if(iconExists(symbol)){
        embed.attachFile(`./content/coin-images/${symbol.toLowerCase()}.png`)
        embed.setAuthor(`${amount} ${symbol} is worth ${priceHelper.getFormattedPrice(price*amount)} ${currency}`, `attachment://${symbol.toLowerCase()}.png`)
    }
    else
        embed.setAuthor(`${amount} ${symbol} is worth ${priceHelper.getFormattedPrice(price*amount)} ${currency}`)
    

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

exports.alertTrendingCoins = (message, json) => {
    let embed = new Discord.RichEmbed()

    embed.setFooter(`Powered by Canada Crypto!`)

    if (json.coins.length === 0) {
        embed.setColor("RED");
        embed.setTitle("Couldnd't find any trending coins :frowning:")
    }
    else{
        embed.setTitle(":earth_americas: Top 7 Trending Coins")
        embed.setDescription(`Top-7 trending coins via CoinGecko as searched by users in the last 24 hours (Ordered by most popular first)`)   
        embed.setColor("BLUE");

        var count = 0;
        json.coins.forEach(coin => {
            if(count <25){
                info = symbolHelper.getGeckoDetails(coin.item.id)
                var vol = info.volpercent > 0? "+" + info.volpercent.toFixed(2) : info.volpercent.toFixed(2)
                embed.addField(`${count + 1}. ${coin.item.name} (${coin.item.symbol})`, `${info.volpercent>0?":green_square:":":red_square: "} Volume (7d) ${vol}% - Price: ${priceHelper.getFormattedPrice(info.price)} USD`);
            }
            count++
        })
    }

    message.channel.send(embed);   
}

exports.handleError = (error) => {

    let embed = new Discord.RichEmbed();
    embed.setFooter(`Powered by Crypto Canada!`);
    embed.setColor('#FF0000');

    if (error.name === 'MongoError' && error.code === 11000) {
        embed.setTitle('Duplicate user')
        embed.addField("User already in database", "Wallet already exists.");
        return embed
    } else {
        embed.setTitle(error.code)
        embed.addField("Error code: " + error.code, "Sorry, an error has occured.");
        return embed
    }

};

exports.showSuccess = (title, message) => {

    const embed = new Discord.RichEmbed()

    embed.setColor("GREEN");
    embed.setTitle('Success!');
    embed.addField(title, message);
    embed.setFooter(`Powered by Crypto Canada!`);

    return embed;
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
        if(results.length > 25){
            embed.setDescription(`Showing 25 of ${results.length} due to Discord message limitations. Consider narrowing the range.`)
        }
        embed.setColor("BLUE");

        var count = 0;

        results.forEach(candidate => {
            if(count <25){
                var vol = candidate.vol > 0? "+" + candidate.vol : candidate.vol

                embed.addField(`${count + 1}. ${candidate.name} (${candidate.symbol})`, 
                `${vol>0?":green_square:":":red_square: "} Volume (7d) ${vol}% [Market cap: ${candidate.cap}](${URL_COINMARKET + candidate.name.replace(/\s+/g, '-').toLowerCase()})`);
            }
            count++
        })
    }

    message.channel.send(embed);   
}

const iconExists = (symbol) => {
    try {
        return fs.existsSync(`${iconPath}${symbol.toLowerCase()}.png`)  
    } catch(err) {
    console.error(err)
    }
}

