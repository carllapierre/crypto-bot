const command = require('../functions/helper-command')
const Discord = require('discord.js')
const fetch = require('node-fetch');



exports.run = async (client, message, args) => {

    let arg1 = command.getOption(args, 1);   
    let arg2 = command.getOption(args, 2);   

    if(!isNumber(arg1) || !isNumber(arg2) || arg1 == "help"){
        handleHelp(message)
    }
    else{
        handlePumpwatch(message, arg1, arg2)
    }
}

const handleHelp = (message) => {
    command.sendHelp(message, pumpCommand)
}

const handlePumpwatch = (message, mincap, maxcap) => {
    var collection = [];
    var url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?market_cap_min=${mincap}&market_cap_max=${maxcap}&convert=USD&start=1&limit=5000`
    fetch(url, {
        method: 'GET',
        headers: {
            'X-CMC_PRO_API_KEY':  process.env.CMC_KEY
          }
    }).then(
      function(u){
           return u.json();
        }
    ).then(function(coins){

        url = `https://www.binance.com/api/v1/exchangeInfo`
        fetch(url).then(
          function(u2){ return u2.json();}
        ).then(
          function(exchangeInfo){  

            coins.data.forEach(coin => {
               const candidate = exchangeInfo.symbols.find(x=>x.status == 'TRADING' && x.symbol == `${coin.symbol}BTC`)
               if(candidate){
                    var obj = {name: coin.name, 
                               cap: coin.quote.USD.market_cap.toFixed(2), 
                               symbol: coin.symbol, 
                               vol:  parseFloat(coin.quote.USD.percent_change_7d.toFixed(2), 10)}
                    if(collection.length == 0){
                        collection.push(obj)
                    }
                    else{
                        var index = collection.findIndex(x=>x.vol < obj.vol)
                        if(index == -1)
                            collection.push(obj)
                        else{
                            collection.splice(index, 0, obj);
                        }
                    }
               }
            })
   
            command.alertCandidates(message, collection) 
        })
    
    })
}

const isNumber = (num) => {
    if(!isNaN(num) && num != '')
        return true
    return false
}

let pumpCommand = {
    commandName: 'pumpwatch',
    optPrefix: '',
    options: [
    {
        aliases: ['help'],
        description: "Will return a list of possible commands.",
        params: '',
    },    
    {
        aliases: ['<min market cap> <max market cap>'],
        description: "Will return a list of pump and dump candidates based off defined market cap boundary",
        params: '',
    }]
}