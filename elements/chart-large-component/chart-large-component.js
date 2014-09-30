(function () {
  'use strict';

  Polymer({

    ready: function (e) {
      //kicks things off for big datasets, get the count!
      this.$.getCount.go();
    },

    responseChanged: function() {
      var self = this;
      var res = this.response;
    },

    handleCount: function(res) {
      res = res.detail.response;
      this.count = res.count;
      this.bins = Math.round(Math.sqrt(this.count));
      this.$.getStats.go();
    },

    handleStats: function(res) {
      res = res.detail.response;
      var attributes = res.features[0].attributes;
      this.min = attributes.min;
      this.max = attributes.max;
      this._getBinnedData();
    },

    handleBins: function(res) {
      res = res.detail.response;
      this.values = this.values || [];
      this.xAxis = this.xAxis || [];
      this.values.push(res.count);
      this.xAxis.push(Math.round(this.startVal));

      if (this.reqs > 0) {
        this.startVal = this.startVal + this.step;
        this.endVal = this.endVal + this.step;
        this.reqs = this.reqs - 1;
        this.$.getBin.go();
      } else {
        this.buildOptions();
      }
    },

    _getBinnedData: function() {
      this.step = Math.round(this.count / this.bins);
      this.step = Math.abs(this.max - this.min) / this.step;
      
      this.startVal = this.min;
      this.endVal = this.min + this.step;
      this.reqs = this.bins - 1;
      this.$.getBin.go();
    },

    renderBarChart: function() {
      this.type = "bar";
      this.$.ajax.go();
    },

    renderLineChart: function() {
      this.type = "line";
      this.$.ajax.go();
    },

    buildOptions: function() {
      var options = {
        "type": "bar",
        "oid": "",
        "ratio": 0.90,
        "values": [
          this.values
        ],
        "xAxis": this.xAxis,
        "regions": [],
        "pattern": "rgb(49,130,189)",
        "statistics": {},
        "xHeight": 50,
        "xRotate": 0,
        "xLabel": this.attribute,
        "yLabel": "Count"
      }

      this.initChart(options);
    },


    initChart: function(options) {
      var self = this;
      
      console.log('options', options);

      var chart = c3.generate({
          bindto: self.$.chart,
          padding: {
            top: 0,
            right: 40,
            bottom: 20,
            left: 60
          },
          data: {
            type: this.type,
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