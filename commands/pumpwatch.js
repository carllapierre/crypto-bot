const command = require('../functions/helper-command')
const symbolHelper = require('../functions/helper-symbol')
const priceHelper = require('../functions/helper-price')

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
            console.log(coins.data.length)
            coins.data.forEach(coin => {
               const candidate = exchangeInfo.symbols.find(x=>x.status == 'TRADING' && x.symbol == `${coin.symbol}BTC`)
               if(candidate)
                    collection.push({name: coin.name, cap: coin.quote.USD.market_cap.toFixed(2), symbol: candidate.symbol })
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