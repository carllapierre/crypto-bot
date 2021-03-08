const command       = require('../functions/helper-command')
const priceHelper   = require('../functions/helper-price')
const graphHelper   = require('../functions/helper-graph')
const outputService = require('../services/service-output')
const cryptoService = require('../services/service-crypto')
const provExchange  = require('../services/providers/fiat/provider-exchange')

exports.run = async (client, message, args) => {
    var parsed = await analyzeParams(args)

    if(parsed.error){
        message.channel.send(outputService.getError(parsed.error));
        return
    }

    switch (parsed.type){
        case "info":
            handleInfo(message, parsed)
            break
        default:
            handleHelp(message)
    }
}

const handleHelp = (message) => {
    command.sendHelp(message, coinCommand)
}

const handleInfo = async (message, parsed) => {

    var crypto   = parsed.arguments.find(x=>x.type=="crypto")
    var timeInterval = parsed.arguments.find(x=>x.type=="interval")
    var graph    = parsed.arguments.find(x=>x.type=="graph")
    var fiat     = parsed.arguments.find(x=>x.type=="fiat")

    var output;
    var tickerInfo = await cryptoService.get(crypto.value, crypto.source, crypto.quoteAsset)

    if(fiat)
    {
        var rate = provExchange.getExchangeRates(fiat.value)
        tickerInfo = alterPrice(tickerInfo, rate)
        tickerInfo = {...tickerInfo, trueQuote: fiat.value}
    }else
    {
        tickerInfo = {...tickerInfo, trueQuote: tickerInfo.quoteAsset}
    }

    output = getCoinOutput(message, tickerInfo)   

    if(timeInterval)
    {
        if(timeInterval.interval == "easteregg"){
            var error = outputService.getError("Nobody needs to know price changes by seconds... Why are you so addicted?")
            message.channel.send(error);
            message.channel.send('https://tenor.com/view/stop-it-get-some-help-gif-7929301');

            return;
        }
        var interval = (timeInterval? timeInterval.interval : "1h")
        var limit =    (timeInterval? timeInterval.limit: null)
        output.setImage( await graphHelper.getChartUrl(crypto.value, crypto.quoteAsset, interval, limit) )
    }else if(graph)
    {
        output.setImage( await graphHelper.getChartUrl(crypto.value, crypto.quoteAsset, "1h") )
    }

    message.channel.send(output);  
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

        if(param.toLowerCase() == "graph" || param.toLowerCase() == "g" || param.toLowerCase() == "chart" ||  param.toLowerCase() == "c")
        {
            paramInfo.arguments.push({
                value: param,
                type: 'graph'
            })
            continue;
        }

        if(!isNaN(param) && param != ""){
            paramInfo.arguments.push({
                value: param,
                type: 'number'
            })
            continue
        }

        var interval = graphHelper.isInterval(param)
        if(interval)
        {
            paramInfo.arguments.push({
                ...interval,
                type: 'interval'
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
                value: symbol.symbol,
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

    //min requirement is one crypto symbol. The rest is optional
    if(!paramInfo.arguments.find(x=>x.type == "crypto"))
        paramInfo.error = `I couldn't find any crypto symbol in your query :neutral_face:`   
    else
        paramInfo.type = "info"

    return paramInfo

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
        aliases: ['<cryptocurrency> <fiat>'],
        description: "Will return the value of the coin converted to the specified currency. Some conversions may not be supported.",
        params: '',
    },
    {
        aliases: ['<chart | graph> <{num}m | {num}h | {num}d> <cryptocurrency>'],
        description: "Will return the value of the coin along with a cool graph using the specified interval",
        params: '',
    }]
}


const getCoinOutput = (message, info) => {    
    var change24h = parseFloat(info.percentChange) 
    var color     = (change24h >= 0)? "GREEN" : "RED"

    var embed = outputService.getEmbed();

    embed.setColor(color);
    embed.addField("Change 24h", (change24h > 0?"+":"") + change24h.toFixed(2) + "%", true) 
    embed.addField("24h High"  , info.high24, true)
    embed.addField("24h Low"   , info.low24,  true) 

    var price = `${info.symbol} Price: ${info.lastPrice} ${info.trueQuote.toUpperCase()}`
    if(info.logo && info.logo.source == "local"){
        embed.attachFile(info.logo.path)
        embed.setAuthor(price, `attachment://${info.symbol.toLowerCase()}.png`)
    }
    else if(info.logo && info.logo.source == "web")
        embed.setAuthor(price, info.logo.path)
    else
        embed.setAuthor(price)
    
    return embed
}

const alterPrice = (ticker, price) => {
    ticker.lastPrice = priceHelper.getFormattedPrice( parseFloat(ticker.lastPrice) * price )
    ticker.high24    = priceHelper.getFormattedPrice( parseFloat(ticker.high24) * price)
    ticker.low24     = priceHelper.getFormattedPrice( parseFloat(ticker.low24)  * price)
    return ticker
}