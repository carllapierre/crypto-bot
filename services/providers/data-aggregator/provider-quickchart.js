const QuickChart = require('quickchart-js');

// Input:
// data:                        Array of data, numbers
// labels:                      Array of labels representing the data, string
// sliceBGColor:                Array of colors representing each slice, string
// width (optional):            Output width of png (default 700)
// height (optional):           Output width of png (default 500)
// backgroundColor (optional):  Background color of png (default transparent)
//
// Output:
// chart object                 Chart object
exports.createOutlabeledPieChart = async (data, labels, sliceBGColor, width, height, backgroundColor) => {

    const chart = new QuickChart();

    chart.setConfig({
        type: 'outlabeledPie',
        data: {
            datasets: [{ data: data, backgroundColor: sliceBGColor }],
            labels: labels,
        },
        options: {
            rotation: Math.PI,
            plugins: {
                borderRadius: 17,
                borderWidth: 2,
                padding: 3,

                "legend": false,
                "outlabels": {
                    "text": "%l (%p)",
                    "color": "black",
                    "stretch": 55,
                    "font": {
                        "resizable": true,
                        "minSize": 16,
                        "maxSize": 20
                    },
                }
            },
            legend: {
                labels: {
                    fontColor: '#FFF'
                }
            }
        }
    }).setWidth(width).setHeight(height).setBackgroundColor(backgroundColor);

    return chart;

}