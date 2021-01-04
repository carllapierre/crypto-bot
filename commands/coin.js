const command      = require('../functions/helper-command')
const symbolHelper = require('../functions/helper-symbol')
const priceHelper  = require('../functions/helper-price')
const Discord      = require('discord.js')
const fetch        = require('node-fetch');
const BASE_ASSET    = "USDT"

exports.run = async (client, message, args) => {
    var parsed = analyzeParams(args)
    switch (parsed.type){
        case "help":
            handleHelp(message)
            break
        case "info":
            handleInfo(message, parsed)
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
const handleInfo = (message, parsed) => {
    var tickerInfo = symbolHelper.getTickerInfo(parsed.arguments[0].value + parsed.arguments[0].quoteAsset)
    //try and convert to base asset
    if(parsed.arguments[0].quoteAsset != BASE_ASSET)
    {
        //conversion from quote asset to base asset
        var baseAssetInfo = symbolHelper.getTickerInfo(parsed.arguments[0].quoteAsset + BASE_ASSET)

        if(typeof baseAssetInfo.lastPrice === "string"){
            tickerInfo = alterPrice(tickerInfo, baseAssetInfo.lastPrice)
            parsed.arguments[0].quoteAsset = BASE_ASSET
        }
    }
    
    if(parsed.arguments.length == 2)
    {
        if(parsed.arguments[1].type == "fiat"){
            tickerInfo = alterPrice(tickerInfo, priceHelper.getExchangeRate(parsed.arguments[1].value))
            parsed.arguments[0].quoteAsset = parsed.arguments[1].value
        }else
        {
            //try usdt to asset specified in param 2
            var newAssetInfo = symbolHelper.getTickerInfo(parsed.arguments[1].value + BASE_ASSET)

            if(typeof newAssetInfo.lastPrice === "string"){
                tickerInfo = alterPrice(tickerInfo, 1/newAssetInfo.lastPrice)
                parsed.arguments[0].quoteAsset = parsed.arguments[1].value 
            }
        }
    }
    command.alertCoin(message, tickerInfo, parsed.arguments[0].value, parsed.arguments[0].quoteAsset)   
}
const handleConversion = (message, parsed) => {
    command.notYetImplemented(message);
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
const analyzeParams = (args) => {
    var paramInfo = {
        type: "unknown",
        error: "",
        arguments: []
    }

    //immediately support help arg to avoid all the work
    if(args.length == 1 || command.getOption(args, 1) == "help"){
        paramInfo.type = "help"
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
        param = symbolHelper.getSymbol(param);
        if (priceHelper.isSupportedFiat(param))
        {
            paramInfo.arguments.push({
                value: param,
                type: 'fiat'
            })
            continue;
        }

        //TODO Check if crypto is available to trade on the binance exchange, also, note the if it can trade with usdt or btc
        var symbol = symbolHelper.findSymbolOnExchange(param, BASE_ASSET);
        if(symbol){
            paramInfo.arguments.push({
                value: param,
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