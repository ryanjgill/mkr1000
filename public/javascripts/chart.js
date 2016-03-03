$(document).ready(function () {
    var _series1 = null
        , _series2 = null
        , readings = null

    var socket = io.connect('http://192.168.1.249:3000')
    socket.on('chart:data', function (readings) {
        if (!_series1 || !_series2) { return; }
        _series1.addPoint([readings.date, readings.value[0]], false, true);
        _series2.addPoint([readings.date, readings.value[1]], true, true);
    })

    var $delay = 1000,
        vMin = 11.5,
        vMax = 14.5,
        cMin = .3,
        cMax = 2.5,
        totalPoints = 25;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },
        tooltip: {
            enabled: false
        }
    });

    var $chart = $('#chart').highcharts({
        chart: {
            type: 'spline',
            // marginRight: -100,
            // marginLeft: -100,
            events: {
                load: function () {
                    _series1 = this.series[0];
                    _series2 = this.series[1];
                }
            }
        },
        title: {
            text: 'Sensor Data'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: [{
            title: {
                text: 'VOLTAGE'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        }, {
            title: {
                text: 'CURRENT'
            },
            opposite: true,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        }],
        tooltip: {
            formatter: function () {
                var unitOfMeasurement = this.series.name === 'VOLTAGE' ? ' V' : ' A';
                return '<b>' + this.series.name + '</b><br/>' +
                    Highcharts.numberFormat(this.y, 1) + unitOfMeasurement;
            }
        },
        legend: {
            enabled: true
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'VOLTAGE',
            yAxis: 0,
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -totalPoints; i <= 0; i += 1) {
                    data.push({
                        x: time + i * $delay,
                        y: getRandomInt(vMin, vMax)
                    });
                }
                return data;
            }())
        }, {
            name: 'CURRENT',
            yAxis: 1,
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -totalPoints; i <= 0; i += 1) {
                    data.push({
                        x: time + i * $delay,
                        y: getRandomInt(cMin, cMax)
                    });
                }
                return data;
            }())
        }]
    });
});