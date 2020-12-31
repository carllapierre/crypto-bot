const command = require('../functions/helper-command')
const symbolHelper = require('../functions/helper-symbol')

const Discord = require('discord.js')
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
    let arg1 = command.getOption(args, 1);   
    if(arg1 == ""){
        handleHelp(message, args)
    }
    else{
        handleCoin(message, args)
    }

}

const handleHelp = (message, args) => {
    command.notYetImplemented(message)
}

const handleCoin = (message, args) => {
    let defaultCurr = "USDT"; 

    let arg1 =  symbolHelper.getSymbol(command.getOption(args, 1))
    let arg2 =  symbolHelper.getSymbol(command.getOption(args, 2))

    defaultCurr = (arg2 != "")? arg2 : defaultCurr

    var url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${arg1}${defaultCurr}`
    fetch(url).then(
      function(u){ return u.json();}
    ).then(
      function(json){
        if(typeof json.lastPrice !== "string"){
            command.alert(message, ` Could not display price in ${defaultCurr}`);
            return;
        }

        command.alertCoin(message, json, arg1, defaultCurr)
      
    })
}