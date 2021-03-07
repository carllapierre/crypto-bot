const command       = require('../functions/helper-command')
const graphHelper   = require('../functions/helper-graph')
const priceHelper   = require('../functions/helper-price')
const request       = require('sync-request')
const cryptoService = require('../services/service-crypto')

exports.run = async (client, message, args) => {

    var parsed = await analyzeParams(args)

    switch (parsed.type){
        case "help":
            command.sendHelp(message, graphCommand)
            break
        case "graph":
            graphHelper.create(message, parsed)
            break
        // case "trending":
        //     handleTrending(message, parsed)
        //     break
        // case "conversion":
        //     handleConversion(message, parsed)
        //     break
        // case "specialbtc":
        //     handleSpecialBtc(message)
        //     break
        default:
            command.sendHelp(message, graphCommand)
    }
}

const analyzeParams = async (args) => {

    var paramInfo = {
        type: "unknown",
        error: "",
        arguments: []
    }

    //immediately support help arg to avoid all the work
    if(args.length == 1 || command.getOption(args, 1).toLowerCase() == "help"){
        paramInfo.type = "help"
        return paramInfo;
    }

    //give a type to all arguments
    for (var i = 1; i < args.length; i++){

        var param = command.getOption(args, i)

        if(!isNaN(param) && param != "") {

            paramInfo.arguments.push({
                value: param,
                type: 'number'
            })
            continue
        }

        //goes through a list of aliases and gets correct symbol
        if (priceHelper.isSupportedFiat(param)) {
            paramInfo.arguments.push({
                value: param,
                type: 'fiat'
            })
            continue;
        }

        // Check if param is a time interval (for graph)
        if ((param[param.length-1] === 'h' || param[param.length-1] === 'd' || param[param.length-1] === 'M') && param.length > 1)  {
            var slice = param.slice(0, param.length - 1);
            if(!isNaN(slice) && slice != "") {
                if (paramInfo.type === "unknown") {
                    paramInfo.type = "graph";
                    paramInfo.arguments.push({
                        value: param,
                        type: 'timeInterval'
                    })
                    continue
                } else {
                    paramInfo.type = "help";
                }
            }
        }

        //TODO Check if crypto is available to trade on the binance exchange, also, note the if it can trade with usdt or btc
        var symbol = await cryptoService.find(param);

        if(symbol){
            paramInfo.arguments.push({
                source: symbol.source,
                value: symbol.id,
                type: 'crypto',
                quoteAsset: symbol.quoteAsset
            })
            continue;
        }

        paramInfo.arguments.push({
            value: param,
            type: 'unknown',
        })

    }

    return paramInfo;

}

let graphCommand = {
    commandName: 'graph',
    optPrefix: '',
    options: [
    {
        aliases: ['help'],
        description: "Will return a list of possible commands.",
        params: '',
    },    
    // {
    //     aliases: ['trending'],
    //     description: "Will return top 7 trending coins via CoinGecko",
    //     params: '',
    // },
    // {
    //     aliases: ['<cryptocurrency>'],
    //     description: "Will return the value of the coin converted to USD by default. Some conversions to USD may not be supported.",
    //     params: '',
    // },
    // {
    //     aliases: ['<cryptocurrency> <fiat | btc>'],
    //     description: "Will return the value of the coin converted to the specified currency. Some conversions may not be supported.",
    //     params: '',
    // },
    // {
    //     aliases: ['<cryptocurrency | fiat> <cryptocurrency | fiat> <amount>'],
    //     description: "Will convert the specified amount using the specified currencies",
    //     params: '',
    // },
    // {
    //     aliases: ['<btc sat | sat btc> <amount> '],
    //     description: "Will convert btc to satoshi coin and vice versa using the specified amount",
    //     hide: true,
    // }
    ]
}


function outputCoin(message, info) {    
    var change24h = parseFloat(info.percentChange) 
    var color     = (change24h >= 0)? "GREEN" : "RED"

    var embed = outputService.getEmbed();

    embed.setColor(color);
    embed.addField("Change 24h", (change24h > 0?"+":"") + change24h.toFixed(2) + "%", true) 
    embed.addField("24h High"  , info.high24, true)
    embed.addField("24h Low"   , info.low24,  true) 

    var price = `${info.symbol} Price: ${info.lastPrice} ${info.quoteAsset}`
    if(info.logo && info.logo.source == "local"){
        embed.attachFile(info.logo.path)
        embed.setAuthor(price, `attachment://${info.symbol.toLowerCase()}.png`)
    }
    else if(info.logo && info.logo.source == "web")
        embed.setAuthor(price, info.logo.path)
    else
        embed.setAuthor(price)
    

    message.channel.send(embed);   
}
