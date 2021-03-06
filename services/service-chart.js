const provQuickChart = require('./providers/data-aggregator/provider-quickchart');

const newOutlabelPieChart = async (data, labels, sliceBGColor, width = 700, height = 500, backgroundColor = 'transparent') => {
    return await provQuickChart.createOutlabeledPieChart(data, labels, sliceBGColor, width, height, backgroundColor);
}

module.exports = {newOutlabelPieChart}