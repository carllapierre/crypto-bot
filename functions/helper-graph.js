const cryptoService     = require('../services/service-crypto');
const chartService      = require('../services/service-chart');
const outputService     = require('../services/service-output');

exports.create = async (message, parsed) => {

    var timeArgument;
    var crypto;
    var timeInterval;
    var limit;

    for (var i = 0; i < parsed.arguments.length; i++) {
        if (parsed.arguments[i].type === "timeInterval")
            timeArgument = parsed.arguments[i];
        if (parsed.arguments[i].type === "crypto")
            crypto = parsed.arguments[i];
    }

    switch(timeArgument.value[timeArgument.value.length-1]) {
        case 'h':
            timeInterval = "1h";
            break;
        case 'd':
            timeInterval = "1d";
            break;
        default:
            timeInterval = "1d";
    }

    var slice = timeArgument.value.slice(0, timeArgument.value.length - 1);
    limit = parseInt(slice);

    var res = await cryptoService.getKlineData(crypto.value, crypto.source, crypto.quoteAsset, timeInterval, undefined, undefined, limit);

    var line = [];
    var bar = [];
    var labels = [];

    for (var i = 0; i < res.length; i++) {
        line.push(res[i].closePrice);
        bar.push(res[i].volume);
        switch (timeInterval) {
            case '1h':
                labels.push(res[i].closeTime.getDate() + ' - ' + res[i].closeTime.getHours() + ":00");
                break;
            case '1d':
                labels.push(formatDate(res[i].closeTime));
                break;
            default:
                labels.push(res[i].closeTime.getDate() + ' - ' + res[i].closeTime.getHours() + ":00");
        }
    }
    console.log(res);
    var chart = await chartService.lineBarGraph(line, bar, labels, "Price", "Volume", "#269398", undefined, `Price of ${crypto.value} with intervals of ${timeInterval}`);
    var output = outputService.getEmbed();
    output.setImage(await chart.getShortUrl());
    message.channel.send(output);
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