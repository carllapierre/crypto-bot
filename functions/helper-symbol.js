const request = require('sync-request')

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

exports.getTickerInfo = (symbol) => {
    var res= request('GET',`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
    var json = JSON.parse(res.getBody('utf8'))

    return json;
}

exports.getTickerInfoZap = () => {
    var res= request('GET',`https://api.coingecko.com/api/v3/simple/price?ids=zap&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`)
    var json = JSON.parse(res.getBody('utf8'))
    
    return {
        lastPrice: `${json.zap.usd}`,
        highPrice:"0",
        lowPrice:"0",
        priceChangePercent: json.zap.usd_24h_change,
        volume:`${json.zap.usd_24h_vol}` 
    };
}


exports.findSymbolOnExchange = (symbol, baseAsset) => {
    var exInfo = getExchangeInfo()

    //prioritize base asset
    var coin = exInfo.symbols.find(x=>x.status == 'TRADING' && x.baseAsset == symbol && x.quoteAsset == baseAsset)
    if(!coin){
        coin = exInfo.symbols.find(x=>x.status == 'TRADING' && x.baseAsset == symbol)
    }
    if(coin)
        return {
            symbol: symbol,
            quoteAsset: coin.quoteAsset
        } 
}

exports.getGeckoInfo = (id) => {

    var res= request('GET',`https://api.coingecko.com/api/v3/simple/price?ids=${id.toLowerCase()}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`)
    var json = JSON.parse(res.getBody('utf8'))
    
    if(!json[id.toLowerCase()])
        return;
    return {
        lastPrice: `${json[id.toLowerCase()].usd}`,
        highPrice:"N/A",
        lowPrice:"N/A",
        priceChangePercent: json[id.toLowerCase()].usd_24h_change,
        volume: `${json[id.toLowerCase()].usd_24h_vol}`
    };
}

const getExchangeInfo = () =>{
    var res= request('GET',`https://www.binance.com/api/v1/exchangeInfo`)
    return JSON.parse(res.getBody('utf8'))
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
    },
    {
        symbol: "SPARK",
        aliases: ["FLR"]
    },
    {
        symbol: "SAFE-HAVEN",
        aliases: ["SHA"]
    }]
}

