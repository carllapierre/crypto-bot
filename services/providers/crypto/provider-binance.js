const request = require('sync-request')

const API_ENDPOINT = "https://api.binance.com/api/v3"
const API_TICKER   = "/ticker/24hr?symbol=" //{symbol}
const API_KLINE    = "/klines?symbol=" //{symbol}
const API_LIST     = "https://www.binance.com/api/v1/exchangeInfo"
const BASE_ASSET = "USDT"

exports.find = async (symbol) =>
{
    var res= request('GET',`https://www.binance.com/api/v1/exchangeInfo`)
    var json = JSON.parse(res.getBody('utf8'))

    var coin = json.symbols.find(x=> x.baseAsset == symbol && x.quoteAsset == BASE_ASSET)
    if(!coin){
        coin = json.symbols.find(x=> x.baseAsset == symbol)
    }
    if(coin)
        return {
            symbol: symbol,
            id: symbol,
            quoteAsset: coin.quoteAsset
        } 
}

exports.get = async (symbol, quoteAsset) =>
{
    //Special rule for binance since they quote in Tether
    if(quoteAsset.toUpperCase() == "USD")
        quoteAsset = "USDT"

    var res= request('GET',`${API_ENDPOINT}${API_TICKER}${symbol}${quoteAsset}`)
    var json = JSON.parse(res.getBody('utf8'))

    return {
        symbol: symbol,
        quoteAsset: quoteAsset,
        percentChange: json.priceChangePercent,
        lastPrice: json.lastPrice,
        high24: json.highPrice,
        low24: json.lowPrice
    };
}

exports.getKlineInfo = async (symbol, quoteAsset, interval, startTime, endTime, limit) => {

    //Special rule for binance since they quote in Tether
    if(quoteAsset.toUpperCase() == "USD")
        quoteAsset = "USDT"

    var options = `&interval=${interval}`;

    if (startTime)
        options += `&startTime=${startTime}`;
    
    if (endTime)
        options += `&endTime=${endTime}`;

    if (limit)
        options += `&limit=${limit}`;

    var res= request('GET',`${API_ENDPOINT}${API_KLINE}${symbol}${quoteAsset}${options}`)
    var json = JSON.parse(res.getBody('utf8'))
    var ret = [];
    for (var i=0; i < json.length; i++) {
        var arr = json[i];
        var data = {
            symbol: symbol,
            quoteAsset: quoteAsset,
            openTime: new Date(arr[0]),
            openPrice: arr[1],
            highPrice: arr[2],
            lowPrice: arr[3],
            closePrice: arr[4],
            volume: arr[5],
            closeTime: new Date(arr[6]),
            quoteAssetVolume: arr[7],
            numberOfTrades: arr[8],
        }
        ret.push(data);
    }
    return ret;
}