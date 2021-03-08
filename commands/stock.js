const command = require('../functions/helper-command')
const controller = require('../functions/helper-stonk')


exports.run = async (client, message, args) => {
    var parsed = analyzeParams(args)
    switch (parsed.type){
        case "help":
            command.sendHelp(message, stonkCommand);
            break
        case "infoTicker":
            controller.infoTicker(message, parsed);
            break
        case "search":
            controller.search(message, parsed);
            break
        default:
            command.sendHelp(message, stonkCommand);
    }
}

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

        if(param !== "search"){
            paramInfo.arguments.push({
                value: param,
                type: 'text',
            })
        }
    }

    if(command.getOption(args, 1).toLowerCase() == "search" && paramInfo.arguments.length >= 1){
        paramInfo.type = "search"
    }

    if (paramInfo.type == "unknown" && paramInfo.arguments.length === 1) {
        paramInfo.type = "infoTicker"
    }

    return paramInfo;

}

let stonkCommand = {
    commandName: 'stonk',
    optPrefix: '',
    options: [
    {
        aliases: ['help'],
        description: "Will return a list of possible commands.",
        params: '',
    },    
    {
        aliases: ['<symbol>'],
        description: "Will return info on that symbol, if it finds it on the market.",
        params: '',
    },
    {
        aliases: ['search <search term>'],
        description: "Search on the market for companies with search terms, and displays all found.",
        params: '',
    },
    ]
}