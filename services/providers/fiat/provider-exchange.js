const request = require('sync-request')

const API_ENDPOINT = "https://free.currconv.com/api/v7/"

exports.getExchangeRates = (fiat) =>
{
    fiat = fiat.toUpperCase()
    var res= request('GET',`${API_ENDPOINT}convert?q=USD_${fiat}&compact=ultra&apiKey=${process.env.FOREX_KEY}`)
    var json = JSON.parse(res.getBody('utf8'))

    return json["USD_" + fiat];
}
