const command = require('../functions/helper-command')
const symbolHelper = require('../functions/helper-symbol')
const priceHelper = require('../functions/helper-price')
const cryptoService = require('../services/service-crypto')

const Discord = require('discord.js')
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
//   var results = await cryptoService.get("ada", "BINANCE");
//   console.log(results);
}

const handleHelp = (message, args) => {
    command.sendHelp(message, coinCommand)
}

const handleCoin = (message, args) => {
    let defaultCurr = "USDT"; 

    let arg1 =  symbolHelper.getSymbol(command.getOption(args, 1))
    let arg2 =  command.getOption(args, 2)
    let arg3 =  command.getOption(args, 3)

    if(arg1.toUpperCase() == "BTC" && arg3 > 21000000){
        command.alertNoCanDoBTC(message);
        return
    }
    
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

                if(!isNaN(arg3) && arg3 != ""){
                    command.alertCoinAmount(message, json, arg1, arg2, arg3)
                }else
                {
                    command.alertCoin(message, json, arg1, arg2)   
                }
                  
            })
            
        }else
        {
            if(!isNaN(arg3) && arg3 != "")
            {
                command.alertCoinAmount(message, json, arg1, defaultCurr, arg3)
            }else
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