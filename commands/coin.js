const command = require('../functions/helper-command')
const symbolHelper = require('../functions/helper-symbol')
const priceHelper = require('../functions/helper-price')

const Discord = require('discord.js')
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
    let arg1 = command.getOption(args, 1);   

    if(arg1 == "" || arg1 == "help"){
        handleHelp(message, args)
    }
    else{
        handleCoin(message, args)
    }

}

const handleHelp = (message, args) => {
    command.sendHelp(message, coinCommand)
}

const handleCoin = (message, args) => {
    let defaultCurr = "USDT"; 

    let arg1 =  symbolHelper.getSymbol(command.getOption(args, 1))
    let arg2 =  command.getOption(args, 2)
    
    //if supported fiat, do usd query and exchange later
    //if non fiat, might be crypto, query with arg to see if anything matches
    if(!priceHelper.isSupportedFiat(arg2))
    {
        arg2 = symbolHelper.getSymbol(arg2);
        defaultCurr = (arg2 != "")? arg2 : defaultCurr
    }

    defaultCurr = defaultCurr.toUpperCase()

    var url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${arg1}${defaultCurr}`
    fetch(url).then(
      function(u){ return u.json();}
    ).then(
      function(json){
        if(typeof json.lastPrice !== "string"){
            command.alert(message, ` Could not display price in ${defaultCurr}`);
            return;
        }

        //alter currency if needs to be exchanged
        if(priceHelper.isSupportedFiat(command.getOption(args, 2)))
        {
            arg2 = arg2.toUpperCase();

            url = `https://api.exchangeratesapi.io/latest?base=USD&symbols=${arg2}`
            fetch(url).then(
              function(u2){ return u2.json();}
            ).then(
              function(json2){
                json.lastPrice = json.lastPrice * json2.rates[arg2]
                json.highPrice = json.highPrice * json2.rates[arg2]
                json.lowPrice  = json.lowPrice  * json2.rates[arg2]
                command.alertCoin(message, json, arg1, arg2)     
            })
            
        }else
        {
            command.alertCoin(message, json, arg1, defaultCurr)
        }      
    })
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
        aliases: ['<cryptocurrency> <{fiat currency} | btc | eth>'],
        description: "Will return the value of the coin converted to the specified currency. Some conversions may not be supported.",
        params: '',
    },
    {
        aliases: ['<btc sat | sat btc> <amount> '],
        description: "Will convert btc to satoshi coin and vice versa using the specified amount",
        hide: true,
    }]
}