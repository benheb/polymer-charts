(function () {
  'use strict';

  Polymer({

    options: {
      "type": "bar",
      "dataSource": null,
      "oid": "",
      "ratio": 0.90,
      "regions": [],
      "pattern": "rgb(49,130,189)",
      "statistics": {},
      "xHeight": 50,
      "xRotate": 0,
      "xLabel": "",
      "yLabel": "Count"
    },

    ready: function (e) {
      this.$.ajax.go();
    },

    responseChanged: function(oldValue) {
      var self = this;
      var res = this.response;
      if ( res !== null ) {
        _.each(res, function(ex, i) {
          //prebaked data example
          if ( !ex.dataSource ) {
            _.defaults(self.options, res[i]);
            self.options.xLabel = ex.xLabel;
            self.initChart(i);
          } else if ( i === "chart-example-two" ) {
            self.url_two = ex.dataSource;
            self.url = self.url_two;
            self.attr_two = ex.xLabel;
            self.$.getCount.go();
          } else if ( i === "chart-example-three" ) {
            self.url_three = ex.dataSource;
            self.url = self.url_three;
            self.attr_three = ex.xLabel;
            self.$.getCount.go();
          }
        });
        

      }
    },

    handleCount: function(res) {
      res = res.detail.response;
      this.count = res.count;
      if (this.count < 1000 ) {
        this.url = this.url_two + "?where=1%3D1&returnGeometry=false&outFields=*&orderByFields=&f=json";
        this.$.getFeatures.go();
      } else {
        this.attribute = this.attr_three;
        this.url = this.url_three;
        this.total_count = this.count.toLocaleString();
        this.bins = Math.round(Math.sqrt(this.count));
        if ( this.bins > 80 ) this.bins = 80;
        this.$.getStats.go();
      }
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
        this.values.unshift(this.attribute);
        this.options.values = [this.values];
        this.options.xAxis = this.xAxis;
        this.options.xLabel = this.attr_three;
        this.initChart("chart-example-three");
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

    initChart: function(id) {
      var self = this;
      var options = this.options;
      console.log('options', options);

      var chart = c3.generate({
          bindto: self.$[id],
          padding: {
            top: 0,
            right: 40,
            bottom: 20,
            left: 60
          },
          data: {
            type: options.type,
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
    },

    buildOptions: function(res) {
      res = res.detail.response;
      
      var self = this;
      var data = [],
        numericAttrs = [],
        stringAttrs = [],
        blacklist = ["OBJECTID", "FID", "STATE_FIPS", "OBJECTID_1"];

      var field;
      _.each(res.fields, function(f, i) {
        if (f.name === self.attr_two ) {
          field = f;
        }
      });

      var  regions = null,
        values = [],
        xAxis = [],
        hist,
        min,
        max,
        xRotate,
        unbinned = {},
        attribute = field.name,
        oid = res.objectIdFieldName,
        attrs = _.pluck( res.features, 'attributes' ),
        ratio = null;

      //blacklist
      if ( _.contains(blacklist, attribute.toUpperCase() ) ) {
        return;
      }

      //all numeric types for now
      //TODO break these into separate functions
      if ( field.type !== "esriFieldTypeString" && field.type !== "esriFieldTypeDate" ) {
        
        var nvals = _.pluck( attrs, attribute);
        max = _.max(nvals);
        min = _.min(nvals) || 0;
        
        //calculate bins
        //default 15 bins 
        var x = d3.scale.linear()
          .domain([min, max])
          .range([min, max]);
        
        //TODO do not force 50, find best number, max 50
        var numbins = Math.round(Math.sqrt(nvals.length));
        if ( numbins > 50 ) {
          numbins = 50;
        }
        
        hist = d3.layout.histogram()
          .bins(numbins)
          (nvals);

        //binned data (bars, lines)
        values = _.pluck(hist, 'y'); //y axis counts
        xAxis = self._getXValues(hist, nvals); //xaxis values
        values.unshift(attribute); //c3.js needs y (values) to start with selected attribute name


      } else {
        //strings
        //need to calculate counts by string type for use in charts
        var vals = _.pluck( attrs, attribute); //get values as usual
        
        //vals.sort(); //sorted charts 
        vals = _.sortBy(vals, function(num) {
          return num;
        });

        //get counts by attr value type
        var counts = _.groupBy(vals, function (item) {
          return item;
        });

        //store ids (oids) for chart/map interaction
        var h = [];
        _.each(counts, function(c) {
          h.push(c);
        });
        
        //create new array to pass to data array
        values.push(attribute);
        _.each(counts, function(f, i) {
          var val = parseInt(f.length, null);
          values.push(val);
          xAxis.push(i);
        });

      }

      self.options.values = [];
      self.options.values.push(values);
      self.options.xAxis = xAxis;
      self.options.xLabel = self.attr_two;
      this.initChart("chart-example-two");
    },

    /*
    * Grab x values from d3 hist, return an array to pass to chart
    * @param {array} hist     d3 calculated histograms
    * @param {array} vals
    */
    _getXValues: function(hist, vals) {
      var dec = false;
      _.each(vals, function(v) {
        var d = v % 1 !== 0;
        if ( d === true ) {
          dec = true;
        }
      });

      var arr = _.pluck(hist, 'x'), values = [];
      _.each(arr, function(val) {
        if ( dec === true ) {
          values.push(parseFloat(val).toFixed(2));
        } else {
          values.push(parseInt(val, null));
        }
      });
      return values;
    }

  });

})();