const provQuickChart = require('./providers/data-aggregator/provider-quickchart');
const QuickChart = require('quickchart-js');

const newOutlabelPieChart = async (data, labels, sliceBGColor, width = 700, height = 500, backgroundColor = 'transparent') => {
    return await provQuickChart.createOutlabeledPieChart(data, labels, sliceBGColor, width, height, backgroundColor);
}

const lineBarGraph = async (dataLine, dataBar, labels, lineName = '', barName = '', lineColor = 'rgb(59, 67, 218)', barColor = 'rgba(63, 225, 97, 0.20)', chartTitle = '', width = 700, height = 500, backgroundColor = 'transparent') => {

    const chart = new QuickChart();

    chart.setConfig({
        type: 'bar',
        data: {

            "labels": labels,

            "datasets": [
                {
                    "type": "line",
                    "label": lineName,
                    "backgroundColor": lineColor,
                    "borderColor": lineColor,
                    "fill": false,
                    "data": dataLine,
                    "yAxisID": "y",
                },
                {
                    "type": "bar",
                    "label": barName,
                    "backgroundColor": barColor,
                    "borderColor": barColor,
                    "data": dataBar,
                    "yAxisID": "y1",
                }
            ]
        }, "options": {
            "title": {
              "display": true,
              "text": chartTitle,
              fontSize: 20,
            },
            "tooltips": {
              "mode": "index",
              "intersect": true
            },
            "scales": {
              "yAxes": [
                {
                  "id": "y",
                  "type": "linear",
                  "display": true,
                  "position": "left",
                  ticks: {
                      //min: Math.min(...dataLine)/2,
                      fontColor: lineColor,
                      callback: (val) => {
                          return "$" + val;
                      }
                  }
                },
                {
                  "id": "y1",
                  "type": "linear",
                  "display": true,
                  "position": "right",
                  "gridLines": {
                    "drawOnChartArea": false
                  },
                  ticks: {
                    min: 0,
                    fontColor: 'rgb(63, 225, 97)',
                    callback: (val) => {
                        if (val > 1000000) {
                          return val/1000000 + 'M';
                        } else if (val > 1000) {
                          return val/1000 + 'k';
                        }
                        return val
                    }
                }
                }
              ]
            }
        }
    }).setWidth(width).setHeight(height).setBackgroundColor(backgroundColor);

    return chart;
    
}

module.exports = {newOutlabelPieChart, lineBarGraph}