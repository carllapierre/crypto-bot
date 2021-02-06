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
        lastprice: json.zap.usd,
        highprice:"0",
        lowprice:"0",
        priceChangePercent: json.zap.usd_24h_change,
        volume: json.zap.usd_24h_vol
    };
}


exports.findSymbolOnExchange = (symbol, baseAsset) => {
    var exInfo = getExchangeInfo()

    if(symbol.toLowerCase() == "zap")
        return {
            symbol: symbol,
            quoteAsset: baseAsset
        } 

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

exports.getGeckoDetails = (id) => {

    var res= request('GET',`https://api.coingecko.com/api/v3/coins/${id.toLowerCase()}/market_chart?vs_currency=usd&days=1&interval=daily`)
    var json = JSON.parse(res.getBody('utf8'))

    return {
        price: json.prices[1][1],
        volpercent: ((json.market_caps[1][1] - json.market_caps[0][1]) / json.market_caps[0][1] * 100),
        marketcap: json.market_caps[1][1]
    }
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
    }]
}

