const request = require('sync-request')

const API_ENDPOINT = "https://api.exchangeratesapi.io"
const API_RATE = "/latest?base=USD&symbols="

exports.getExchangeRates = (fiat) =>
{
    fiat = fiat.toUpperCase()
    var res= request('GET',`${API_ENDPOINT}${API_RATE}${fiat}`)
    var json = JSON.parse(res.getBody('utf8'))
    return json.rates[fiat];
}
