const command      = require('../functions/helper-command')
const outputService  = require('../services/service-output')
const priceHelper  = require('../functions/helper-price')
const request      = require('sync-request')
const cryptoService = require('../services/service-crypto')

exports.run = async (client, message, args) => {
    var parsed = await analyzeParams(args)

    switch (parsed.type){
        case "help":
            handleHelp(message)
            break
        case "info":
            handleInfo(message, parsed)
            break
        case "trending":
            handleTrending(message, parsed)
            break
        case "conversion":
            handleConversion(message, parsed)
            break
        case "specialbtc":
            handleSpecialBtc(message)
            break
        default:
            handleDefault(message, parsed)
    }
}

const handleHelp = (message) => {
    command.sendHelp(message, coinCommand)
}
const handleSpecialBtc = (message) => {
    command.alertNoCanDoBTC(message);
}
const handleDefault = (message, parsed) => {
    command.alert(message, parsed.error);
}
const handleInfo = async (message, parsed) => {
    var tickerInfo = await cryptoService.get(parsed.arguments[0].value, parsed.arguments[0].source)
    outputCoin(message, tickerInfo)    
}

const handleConversion = (message, parsed) => {
    command.notYetImplemented(message);
}
const handleTrending = (message, parsed) => {
    var res= request('GET',`https://api.coingecko.com/api/v3/search/trending`)
    var json = JSON.parse(res.getBody('utf8'))

    command.alertTrendingCoins(message, json) 
    return json;
}

const alterPrice = (ticker, price) => {
    ticker.lastPrice = ticker.lastPrice * price
    ticker.highPrice = ticker.highPrice * price
    ticker.lowPrice  = ticker.lowPrice  * price
    return ticker
}

//Will analyze parameters and give information on the data provided
//Different types available
//1. 'help': will trigger help function
//2. 'conversion': will trigger conversion from one currency to another
//3. 'info': will get info on the given crypto
//4. 'specialbtc': will trigger special message for 21m conversion query
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

    if(args.length >= 2 && command.getOption(args, 1).toLowerCase() == "trending"){
        paramInfo.type = "trending"
        return paramInfo;
    }


    //give a type to all arguments
    for (var i = 1; i < args.length; i++){
        var param = command.getOption(args, i)
        if(!isNaN(param) && param != ""){
            paramInfo.arguments.push({
                value: param,
                type: 'number'
            })
            continue
        }

        //goes through a list of aliases and gets correct symbol
        if (priceHelper.isSupportedFiat(param))
        {
            paramInfo.arguments.push({
                value: param,
                type: 'fiat'
            })
            continue;
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

    //analyze arguments and give a command type
    switch (paramInfo.arguments.length)
    {
        //only 1 arg
        case 0:
            return paramInfo;
        case 1:
            if(paramInfo.arguments[0].type == "crypto") //simple crypto to usd
                paramInfo.type = "info";
            else{
                if(paramInfo.arguments[0].type == "fiat") //can't do $coin cad since api don't give that info
                    paramInfo.error = `Unfortunately, I can't provide info on FIAT currencies.`   
                else 
                    paramInfo.error = `Unfortunately, I counldn't find any information on ${paramInfo.arguments[0].value}` 
            }
            return paramInfo;
        //only 2 args
        case 2:
            if(paramInfo.arguments[0].type == "fiat") //can't do $coin cad since api don't give that info
                paramInfo.error = `Unfortunately, I can't provide info on FIAT currencies.`        
            else if(paramInfo.arguments[0].type == "crypto" && paramInfo.arguments[1].type != "unknown")//support for $coin crypto fiat or $coin crypto crypto
                paramInfo.type = "info";          
            else       
                paramInfo.error = `Unfortunately, I couldn't find info for ${paramInfo.arguments[0].value} to ${paramInfo.arguments[1].value}` 
            
            return paramInfo;
        //only 3 args
        case 3:
            //suport $coin currency currency amount
            if(paramInfo.arguments[0].type != "unknown" && paramInfo.arguments[1].type != "unknown" && paramInfo.arguments[2].type == "number")
                if(paramInfo.arguments[0].value.toLowerCase() == "btc" && paramInfo.arguments[0].value > 21000000)
                    paramInfo.type = "specialbtc"
                else
                    paramInfo.type = "conversion";     
            else{
                if(paramInfo.arguments[2].type != "number"){
                    paramInfo.error = `Please make sure an amount is specified in the third parameter.`
                }else
                {
                    paramInfo.error = `Unfortunately, it seems this conversion is not supported.`
                }
            }
            return paramInfo;
    }
}

let coinCommand = {
    commandName: 'coin',
    optPrefix: '',
    options: [
    {
        aliases: ['help'],
        description: "Will return a list of possible commands.",
        params: '',
    },    
    {
        aliases: ['trending'],
        description: "Will return top 7 trending coins via CoinGecko",
        params: '',
    },
    {
        aliases: ['<cryptocurrency>'],
        description: "Will return the value of the coin converted to USD by default. Some conversions to USD may not be supported.",
        params: '',
    },
    {
        aliases: ['<cryptocurrency> <fiat | btc>'],
        description: "Will return the value of the coin converted to the specified currency. Some conversions may not be supported.",
        params: '',
    },
    {
        aliases: ['<cryptocurrency | fiat> <cryptocurrency | fiat> <amount>'],
        description: "Will convert the specified amount using the specified currencies",
        params: '',
    },
    {
        aliases: ['<btc sat | sat btc> <amount> '],
        description: "Will convert btc to satoshi coin and vice versa using the specified amount",
        hide: true,
    }]
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
