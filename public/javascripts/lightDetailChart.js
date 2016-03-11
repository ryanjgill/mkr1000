$(document).ready(function () {
    var _series1
        , _series2
        , $lightDisplay = $('div.sensor-values div.light')
        , $users = $('.users')
        ;

    var socket = io.connect('http://192.168.1.249:3000')
    //socket.on('chart:data', function (readings) {
    //    if (!_series1 || !_series2 || !_series3) { return; }
    //    _series1.addPoint([readings.date, readings.value[0]], false, true);
    //    _series2.addPoint([readings.date, readings.value[1]], false, true);
    //    _series3.addPoint([readings.date, readings.value[2]], true, true);
    //
    //    updateSensorDisplayValues(readings.value);
    //    console.log(readings.value);
    //})

    socket.on('usersCount', function (total) {
        updateUsersCount(total.totalUsers);
    });

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateUsersCount(total) {
        $users.html(total);
    }

    function updateLight(value) {
        $lightDisplay.html(value + '<span> %</span>');
    }

    var detailChart;

    // create the detail chart
    function createDetail(masterChart) {

        // prepare the detail chart
        var detailData = [],
            detailStart = data[0][0];

        $.each(masterChart.series[0].data, function() {
            if (this.x >= detailStart) {
                detailData.push(this.y);
            }
        });

        // create a detail chart referenced by a global variable
        detailChart = $('#detail-container').highcharts({
            chart: {
                reflow: true
            },
            credits: false,
            title: {
                text: 'Light Data'
            },
            subtitle: {
                text: 'Select an area by dragging across the lower chart'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: null
                },
                maxZoom: 0.1
            },
            tooltip: {
                formatter: function() {
                    var point = this.points[0];
                    return '<b>' + point.series.name + '</b><br/>' + Highcharts.dateFormat('%A %B %e %Y', this.x) + ':<br/>' +
                        Highcharts.numberFormat(point.y, 2) + ' % Full Light Exposure';
                },
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 3
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Light Exposure',
                pointStart: detailStart,
                pointInterval: 24 * 3600 * 1000,
                data: detailData,
                color: Highcharts.getOptions().colors[1]
            }],

            exporting: {
                enabled: false
            }

        }).highcharts(); // return chart
    }

    // create the master chart
    function createMaster(data) {
        $('#master-container').highcharts({
                chart: {
                    reflow: true,
                    zoomType: 'x',
                    events: {

                        // listen to the selection event on the master chart to update the
                        // extremes of the detail chart
                        selection: function(event) {
                            var extremesObject = event.xAxis[0],
                                min = extremesObject.min,
                                max = extremesObject.max,
                                detailData = [],
                                xAxis = this.xAxis[0];

                            // reverse engineer the last part of the data
                            $.each(this.series[0].data, function() {
                                if (this.x > min && this.x < max) {
                                    detailData.push([this.x, this.y]);
                                }
                            });

                            // move the plot bands to reflect the new detail span
                            xAxis.removePlotBand('mask-before');
                            xAxis.addPlotBand({
                                id: 'mask-before',
                                from: data[0][0],
                                to: min,
                                color: 'rgba(0, 0, 0, 0.2)'
                            });

                            xAxis.removePlotBand('mask-after');
                            xAxis.addPlotBand({
                                id: 'mask-after',
                                from: max,
                                to: data[data.length - 1][0],
                                color: 'rgba(0, 0, 0, 0.2)'
                            });

                            detailChart.series[0].setData(detailData);

                            return false;
                        }
                    }
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                    showLastTickLabel: true,
                    //maxZoom: 14 * 24 * 3600000, // fourteen days
                    plotBands: [{
                        id: 'mask-before',
                        from: data[0][0],
                        to: data[data.length - 1][0],
                        color: 'rgba(0, 0, 0, 0.2)'
                    }],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    gridLineWidth: 0,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    min: 0.6,
                    showFirstLabel: false
                },
                tooltip: {
                    formatter: function() {
                        return false;
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        fillColor: {
                            linearGradient: [0, 0, 0, 70],
                            stops: [
                                [0, Highcharts.getOptions().colors[1]],
                                [1, 'rgba(255,255,255,0)']
                            ]
                        },
                        lineWidth: 1,
                        marker: {
                            enabled: false
                        },
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        enableMouseTracking: false
                    }
                },

                series: [{
                    type: 'area',
                    name: 'Light Exposure',
                    pointInterval: 24 * 3600 * 1000,
                    pointStart: data[0][0],
                    data: data,
                    color: Highcharts.getOptions().colors[1]
                }],

                exporting: {
                    enabled: false
                }

            }, function(masterChart) {
                createDetail(masterChart);
            })
            .highcharts(); // return chart instance
    }

    $.get('/api/light', function (measurements) {
        data = JSON.parse(measurements);
        // create master and in its callback, create the detail chart
        createMaster(data);
    });


});