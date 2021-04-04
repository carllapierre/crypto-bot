const request = require('sync-request')
const serviceCache = require('../../service-cache')

const API_ENDPOINT = "https://openexchangerates.org/api/latest.json?app_id="
const BRAINSTEM = "BS_CURRENCY" 
const SHORT_TERM_MEMORY = 86400 //24 hours

exports.getExchangeRates = (fiat) =>
{
    fiat = fiat.toUpperCase()

    var info = serviceCache.find(BRAINSTEM);
    if(!info){
        var res= request('GET',`${API_ENDPOINT}${process.env.FOREX_KEY}`)
        info = JSON.parse(res.getBody('utf8'))
        serviceCache.save(BRAINSTEM, info, SHORT_TERM_MEMORY)
        console.log("Saving currencies to brain...")
    }

    return info.rates[fiat];
}
