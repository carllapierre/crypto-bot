const Discord = require('discord.js')
const request = require('sync-request')
const AV_KEY = process.env.ALPHAVANTAGE_KEY;
const priceHelper = require('../functions/helper-price')
const Stock = require('../models/stock');

exports.infoTicker = async (message, parsed) => {

    var res= await request('GET',`https://www.alphavantage.co/query`, {
        qs: {
            'function': "GLOBAL_QUOTE",
            "symbol": parsed.arguments[0].value,
            "apikey": AV_KEY,
            "datatype": "json",
        }
    });
    
    var json = JSON.parse(res.getBody('utf8'))

    //If no info on symbol found:
    if (Object.keys(json["Global Quote"]).length === 0) {
        const e = {
            name: "Symbol not found",
            description: `We couldn't find ${parsed.arguments[0].value} on the market. Are you sure you wrote it properly?\nTry searching for the symbol by doing $stonk search <symbol> first`
        }
        message.channel.send(customWarning(e));
        return;
    }

    //If found, complete
    const stock = new Stock(json);
    await stock.populateData(stock.symbol);
    message.channel.send(embedStock(stock));

}

exports.search = async (message, parsed) => {
    
    var searchString = parsed.arguments[0].value;
    for (var i=1; i<parsed.arguments.length;i++) {
        searchString += ' ' + parsed.arguments[i].value;
    }

    var res= await request('GET',`https://www.alphavantage.co/query`, {
        qs: {
            'function': "SYMBOL_SEARCH",
            "keywords": searchString,
            "apikey": AV_KEY,
            "datatype": "json",
        }
    });

    var json = JSON.parse(res.getBody('utf8'))

    // If no results found
    if (json.bestMatches.length === 0) {
        const e = {
            name: "No results found",
            description: `We couldn't find any info with "${searchString}". Try refining your terms, or excluding some.`
        }
        message.channel.send(customWarning(e));
        return;
    }

    // Else, build a Discord embed and send
    message.channel.send(embedSearchResults(json));

}


// Need to add no result option
const embedSearchResults = (res) => {
    if (res.bestMatches) {

        const embed = new Discord.RichEmbed()
        embed.setColor("BLUE");
        embed.setTitle('Best Search Results')
        embed.setFooter(`Powered by Crypto Canada!`);

        var arr = res.bestMatches;

        for (var i = 0; i < arr.length; i++) {
            var result = arr[i];
            var name = result["2. name"];
            var description = `Symbol: ${result["1. symbol"]} \nRegion: ${result["4. region"]}\nType: ${result["3. type"]}\nCurrency: ${result["8. currency"]}`;
            embed.addField(name, description, true);
        }

        return embed;

    }
}

const embedStock = (stock) => {

    const embed = new Discord.RichEmbed()
    
    embed.setTitle(`${stock.name} - Price: ${priceHelper.getFormattedPrice(stock.price)} (${stock.currency})`);
    embed.setFooter(`Powered by Crypto Canada!`);
    
    var prcChange = stock.changePercentage.replace('%', '');
    prcChange = Number.parseFloat(prcChange).toFixed(2);
    
    if (prcChange > 0) {
        embed.setColor("GREEN");
    } else {
        embed.setColor("RED");
    }

    prcChange = prcChange + '%';

    embed.addField("Change:", prcChange, true);
    embed.addField("High:", priceHelper.getFormattedPrice(stock.high), true);
    embed.addField("Low:", priceHelper.getFormattedPrice(stock.low), true);
    embed.addField("Volume:", stock.volume, true);
    embed.addField("Type:", stock.type, true);
    embed.addField("Symbol:", stock.symbol, true);

    return embed;

}

const customWarning = (e) => {
    let embed = new Discord.RichEmbed();
    embed.setFooter(`Powered by Crypto Canada!`);
    embed.setColor('#ffff00');
    embed.setTitle(e.name)
    embed.addField("Warning", e.description);
    return embed
}