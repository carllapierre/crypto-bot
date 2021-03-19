const command      = require('../functions/helper-command')
const priceHelper = require('../functions/helper-price')
const symbolHelper = require('../functions/helper-symbol')
const controller = require('../functions/helper-portfolio')
const { setMaxListeners } = require('../models/wallet.model')
const cryptoService = require('../services/service-crypto')
const BASE_ASSET    = "USDT"

exports.run = async (client, message, args) => {

    try {
        var parsed = await analyzeParams(args)

        if(parsed.error){
            command.alert(message, parsed.error);
        }
        switch (parsed.type){
            case "help":
                command.sendHelp(message, portfolioCommand)
                break
            case "prices":
                controller.showPrices(message)
                break
            case "show":
                controller.show(message, parsed);
                break
            case "delete":
                controller.delete(message, parsed);
                break
            case "add":
                controller.add(message, parsed)
                break
            case "remove":
                controller.remove(message, parsed)
                break
            case "set":
                controller.set(message, parsed)
                break   
            case "showPublic":
                controller.showPublic(message, parsed);
                break
            case "showChart":
                controller.showChart(message, parsed);
                break
            case "changeCurrency":
                controller.changeCurrencyDefault(message, parsed);
                break
            default:
                command.sendHelp(message, portfolioCommand)
        }
    } catch (e) {
        message.author.send(command.handleError(e));
    }
}

let portfolioCommand = {
    commandName: 'portfolio',
    optPrefix: '',
    options: [
    {
        aliases: ['help'],
        description: "Will return a list of possible commands.",
        params: '',
    },
    {
        aliases: ['show'],
        description: "Will send you a private message with your portfolio's content. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['show public'],
        description: "Will post your portfolio to the channel where command was entered, for the whole world to see!",
        params: '',
    },
    {
        aliases: ['chart'],
        description: "Will present a pie chart of your holdings (with no amount, just %), in the channel where command was entered.",
        params: '',
    },
    {
        aliases: ['delete'],
        description: "Will delete your portfolio from our database. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['defcurrency <fiat currency>'],
        description: "Change your portfolio's default currency for reporting.",
        params: '',
    },
    {
        aliases: ['add <quantity> <cryptocurrency>'],
        description: "Add the specified quantity to your portfolio. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['remove <quantity> <cryptocurrency>'],
        description: "Subtract the specified quantity from your portfolio. (Cannot go negative). You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['set <quantity> <cryptocurrency>'],
        description: "Set the crypto in your portfolio to a specified quantity. You can direct message the bot as well.",
        params: '',
    },
    ]
}


//Will analyze parameters and give information on the data provided
//Different types available
//1. 'help': will trigger help function
//2. 'create': will create a portfolio in the DB for the user
//3. 'Add': Will add specified crypto qty
//4. 'Remove': Will remove specified crypto qty

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

    if(command.getOption(args, 1).toLowerCase() == "show") {
        paramInfo.type = "show";
        if (command.getOption(args,2).toLowerCase() == "public") {
            paramInfo.type = "showPublic";
        }
        return paramInfo;
    }

    if (command.getOption(args,1).toLowerCase() == "chart" || command.getOption(args,1).toLowerCase() == "holdings") {
        paramInfo.type = "showChart";
        return paramInfo;
    }

    if(command.getOption(args, 1).toLowerCase() == "delete") {
        paramInfo.type = "delete"
        return paramInfo;
    }

    if(command.getOption(args, 1).toLowerCase() == "prices" || command.getOption(args, 1).toLowerCase() == "price" || command.getOption(args, 1).toLowerCase() == "p") {
        paramInfo.type = "prices"
        return paramInfo;
    }

    if(command.getOption(args, 1).toLowerCase() == "add") {
        paramInfo.type = "add"
    }

    if(command.getOption(args, 1).toLowerCase() == "remove") {
        paramInfo.type = "remove"
    }

    if(command.getOption(args, 1).toLowerCase() == "set") {
        paramInfo.type = "set"
    }

    if(command.getOption(args, 1).toLowerCase() == "defcurrency") {
        paramInfo.type = "changeCurrency"
    }

    //Goes through the remainder of the arguments after "$portfolio X" and assigns a type.
    if(args.length > 2){
        for (var i = 2; i < args.length; i++){

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

            // Checks if entered data is FIAT. If so, prevent from continuing for now.
            if (priceHelper.isSupportedFiat(param))
            {
                paramInfo.arguments.push({
                    value: param,
                    type: 'fiat'
                })
                continue;
            }

            var symbol = await cryptoService.find(param)
            console.log(symbol)
            if(symbol){
                paramInfo.arguments.push({
                    source: symbol.source,
                    value: symbol.symbol,
                    type: 'crypto',
                    quoteAsset: symbol.quoteAsset
                })
                continue;
            }

            // If all fails, unknown argument.
            paramInfo.arguments.push({
                value: param,
                type: 'unknown',
            })
        }
    }

    switch (paramInfo.type)
    {
        //only 1 arg
        case "unknown":
            paramInfo.type = "help";
            return paramInfo;
        case "add":
        case "remove":
        case "set":
            if(paramInfo.arguments.length != 2){
                paramInfo.error = `It seems you haven't provided the correct arguments. Type "$portfolio help" for usage info.`    
                return paramInfo  
            }

            if(paramInfo.arguments[0].type == "number" && (paramInfo.arguments[1].type == "crypto" || (paramInfo.arguments[1].type == "fiat" && paramInfo.arguments[1].value == "USDT"))) 
                return paramInfo;
            else{
                paramInfo.error = `It seems you haven't provided the correct arguments. Type "$portfolio help" for usage info.`   
                return paramInfo;
            }
        case "changeCurrency":
            if(paramInfo.arguments.length != 1){
                paramInfo.error = `It seems you haven't provided the correct arguments. Type "$portfolio help" for usage info.`    
                return paramInfo
            }

            if(paramInfo.arguments[0].type == "fiat") //can't do $coin cad since api don't give that info
                return paramInfo
            else {
                paramInfo.error = `Unfortunately, you can only set FIAT currency as a default.` 
                return paramInfo;
            }
    }

    return paramInfo;
}