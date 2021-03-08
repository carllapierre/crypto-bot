const cryptoService     = require('../services/service-crypto');
const chartService      = require('../services/service-chart');

exports.getChartUrl = async (value, quoteAsset, interval = "1h", limit = "24") => {

    var line = [];
    var bar = [];
    var labels = [];

    var res = await cryptoService.getKlineData(value, quoteAsset, interval, undefined, undefined, limit);
    if (res) {
        for (var i = 0; i < res.length; i++) {
            line.push(res[i].closePrice);
            bar.push(res[i].volume);
            switch (interval) {
                case '1h':
                    labels.push(formatSingleEntry(res[i].closeTime.getDate()) + ' - ' + formatSingleEntry(res[i].closeTime.getHours()) + ":00");
                    break;
                case '1d':
                    labels.push(formatDate(res[i].closeTime));
                    break;
                case '1m':
                    labels.push(formatSingleEntry(res[i].closeTime.getHours()) + ":" + formatSingleEntry(res[i].closeTime.getMinutes()));
                    break;
                default:
                    labels.push(formatSingleEntry(res[i].closeTime.getDate()) + ' - ' + formatSingleEntry(res[i].closeTime.getHours()) + ":00");
            }
        }
        var chart = await chartService.lineBarGraph(line, bar, labels, `Price (in ${quoteAsset})`, "Volume", "#269398", undefined, `Price of ${value} with intervals of ${interval} (UTC-London)`);
        return await chart.getShortUrl();

    } else {
        return 'https://cdn.discordapp.com/attachments/814697936113500223/818281855924961280/graph.png';
    }
  
}


exports.isInterval = (str) =>
{
    var timeInterval;
    var char = str[str.length-1]
    switch(char) {
        case 'h':
        case 'd':
        case 'm':
            timeInterval = "1" + char;
            break;
        case 's':
            timeInterval = "easteregg";
            break;
    }

    var slice = str.slice(0, str.length - 1);
    var limit;
    if(!isNaN(slice))
        limit = parseInt(slice);

    if(timeInterval && limit)
        return {
            interval: timeInterval,
            limit: limit
        }
}

function formatDate(date) {
    
    month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    return [year, month, day].join('-');
}

function formatSingleEntry(day) {
    day = day.toString();
    if (day.length < 2){
        day = '0' + day;
    }
    return day;
}