const command      = require('../functions/helper-command')
const priceHelper = require('../functions/helper-price')
const symbolHelper = require('../functions/helper-symbol')
const controller = require('../functions/helper-wallet')
const BASE_ASSET    = "USDT"

exports.run = async (client, message, args) => {

    var parsed = analyzeParams(args)

    switch (parsed.type){
        case "help":
            command.sendHelp(message, walletCommand)
            break
        case "create":
            controller.create(message, parsed);
            break
        case "show":
            controller.show(message, parsed);
            break
        case "delete":
            controller.delete(message, parsed);
            break
        case "add":
            if (parsed.arguments.length == 0) {
                command.sendHelp(message, walletCommand)
            } else {
                controller.add(message, parsed)
            }
            break
        case "remove":
            if (parsed.arguments.length == 0) {
                command.sendHelp(message, walletCommand)
            } else {
                controller.remove(message, parsed)
            }
            break
        case "set":
            if (parsed.arguments.length == 0) {
                command.sendHelp(message, walletCommand)
            } else {
                controller.set(message, parsed)
            }
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
        case "fiat-error":
            command.alert(message, parsed.error);
            break
        default:
            command.sendHelp(message, walletCommand)
    }
}

let walletCommand = {
    commandName: 'wallet',
    optPrefix: '',
    options: [
    {
        aliases: ['help'],
        description: "Will return a list of possible commands.",
        params: '',
    },
    {
        aliases: ['create'],
        description: "Will create a new wallet with your Discord ID. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['show'],
        description: "Will send you a private message with your wallet's content. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['show public'],
        description: "Will post your wallet to the channel where command was entered, for the whole world to see!",
        params: '',
    },
    {
        aliases: ['show chart'],
        description: "Will present a pie chart of your holdings (with no amount, just %), in the channel where command was entered.",
        params: '',
    },
    {
        aliases: ['delete'],
        description: "Will delete your wallet from our database. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['defcurrency <fiat currency>'],
        description: "Change your wallet's default currency for reporting.",
        params: '',
    },
    {
        aliases: ['add <quantity> <cryptocurrency>'],
        description: "Add the specified quantity to your wallet. You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['remove <quantity> <cryptocurrency>'],
        description: "Subtract the specified quantity from your wallet. (Cannot go negative). You can direct message the bot as well.",
        params: '',
    },
    {
        aliases: ['set <quantity> <cryptocurrency>'],
        description: "Set the crypto in your wallet to a specified quantity. You can direct message the bot as well.",
        params: '',
    },
    ]
}


//Will analyze parameters and give information on the data provided
//Different types available
//1. 'help': will trigger help function
//2. 'create': will create a wallet in the DB for the user
//3. 'Add': Will add specified crypto qty
//4. 'Remove': Will remove specified crypto qty

const analyzeParams = (args) => {

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

    // Looks at first argument after $wallet, to specify what type of command this will be

    if(command.getOption(args, 1).toLowerCase() == "create") {
        paramInfo.type = "create"
        return paramInfo;
    }

    if(command.getOption(args, 1).toLowerCase() == "show") {
        paramInfo.type = "show";
        if (command.getOption(args,2).toLowerCase() == "public") {
            paramInfo.type = "showPublic";
        } else if (command.getOption(args,2).toLowerCase() == "chart" || command.getOption(args,2).toLowerCase() == "holdings") {
            paramInfo.type = "showChart";
        }
        return paramInfo;
    }

    if(command.getOption(args, 1).toLowerCase() == "delete") {
        paramInfo.type = "delete"
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

    //Goes through the remainder of the arguments after "$wallet X" and assigns a type.
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

        var symbol = symbolHelper.findSymbolOnExchange(param, BASE_ASSET);

        if(symbol){
            paramInfo.arguments.push({
                value: param,
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
    return paramInfo;
}