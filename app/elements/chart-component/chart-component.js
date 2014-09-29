(function () {
  'use strict';

  Polymer({

    ready: function (e) {
      console.log('create me!') 

      var options = {};
      options.pattern = "rgb(49,130,189)";
      options.type = "bar";
      options.oid = "";
      options.ratio = 0.95;
      options.regions = [];
      options.statistics = {};
      options.type = "esriFieldTypeDouble";
      options.values = [
        ["latitude", 10, 5, 40, 10, 50, 10, 30, 40, 20, 10]
      ];
      options.xAxis = [
        "39.10", "39.19", "39.28", "39.37", "39.46",
        "39.55", "39.64", "39.73", "39.82", "39.91"
      ];
      options.xHeight = 75;
      options.xLabel = "latitude";
      options.xRotate = 0;
      options.yLabel = "Count";

      var str = JSON.stringify(options);
      console.log('str', str);
      this.initChart(options);
    },

    initChart: function(options) {
      var self = this;
      console.log('make a chart!');
      
      var chart = c3.generate({
          bindto: self.$.chart,
          padding: {
            top: 0,
            right: 20,
            bottom: 0,
            left: 80
          },
          data: {
            type: "bar",
            columns: options.values,
            selection: {
              enabled: true,
              grouped: true,
              multiple: true
            }
          },
          bar: {
            width: {
                ratio: options.ratio // this makes bar width n% of length between ticks
            }
          },
          tooltip: {
            format: {
              title: function(d, i) {
                var a, b;
                if ( !isNaN(options.xAxis[d]) ) {
                  a = options.xAxis[d].toLocaleString();
                  b =  (options.xAxis[d+1]) ? ' to '+options.xAxis[d+1].toLocaleString() : "";
                } else {
                  a = options.xAxis[d];
                  b = "";
                }
                return a + b;
              },
              value: function(value, ratio, d) {
                return value + " Features";
              } 
            }
          },
          zoom: { enabled: false },
          color: {
            pattern: [ options.pattern ]
          },
          legend: {
            show: false
          },
          grid: {
            y: {
              lines: [{value: 0}]
            }
          },
          regions: options.regions,
          axis: {
            x: {
              //type: 'category',
              //categories: options.xAxis,
              tick: {
                fit:true,
                rotate: options.xRotate,
                culling: {
                  max: options.maxLabels
                },
                format: function (x, y) { 
                  if (options.type === "esriFieldTypeDate") {
                    return moment(parseInt(options.xAxis[x], null)).format('MMM Do, YYYY');
                  } else if ( !isNaN(options.xAxis[x]) ) {
                    var a = (options.xAxis[x]) ? options.xAxis[x].toLocaleString() : "";
                    return a;
                  } else {
                    return options.xAxis[x];
                  }
                }
              },
              height: options.xHeight,
              label: {
                text: options.xLabel,
                position: 'outer-left'
              }
            },
            y: {
              label: {
                text: options.yLabel,
                position: 'outer-bottom'
              }
            }
          }
        });
    }

  });

})();