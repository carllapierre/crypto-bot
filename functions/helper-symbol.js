
exports.getSymbol = (arg) => {
    let symbol = arg;
    mapper.symbols.forEach(aSymbol => {
        aSymbol.aliases.forEach(alias => {
            if(alias.toLowerCase() == arg.toLowerCase()){
                symbol = aSymbol.symbol;
                return 
            }
        })
    });
    return symbol.toUpperCase();
}


const mapper = {
    symbols: [{
        symbol: "USDT",
        aliases: ["usdt", "us", "usd", "trumpcoin", "usa", "shitcoin", "american"]
    },
    {
        symbol: "ETH",
        aliases: ["eth", "ether", "eth2", "eth2.0", "ethereum"]
    },
    {
        symbol: "XRP",
        aliases: ["xrp", "ripcoin", "rippledoff", "yikescoin"]
    },
    {
        symbol: "BTC",
        aliases: ["btc", "bitcoin", "bit"]
    }]
}

