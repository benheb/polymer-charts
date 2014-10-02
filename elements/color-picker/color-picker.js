(function () {
  'use strict';

  Polymer({

    ready: function() {
      this.data = this.generateData();
    },

    selectColor: function(e) {
      this.selectedColor = e.detail.data.color;
      this.fire('color-change', {msg: this.selectedColor});
    },

    generateData: function() {
      var colors = [
        //brown
        {"color": "#361E18"},
        {"color": "#543E36"},
        {"color": "#72594B"},
        {"color": "#917763"},
        {"color": "#B19277"},
        {"color": "#D1B79F"},
        {"color": "#EBD9C2"},

        //gray
        {"color": "#252525"},
        {"color": "#525252"},
        {"color": "#737373"},
        {"color": "#969696"},
        {"color": "#BDBDBD"},
        {"color": "#D9D9D9"},
        {"color": "#F7F7F7"},

        //blue (dark)
        {"color": "#192E24"},
        {"color": "#2D4A4C"},
        {"color": "#375976"},
        {"color": "#547298"},
        {"color": "#7C86B6"},
        {"color": "#B0B3DB"},
        {"color": "#DADBE6"},

        //red (dark)
        {"color": "#512506"},
        {"color": "#793404"},
        {"color": "#AE4C02"},
        {"color": "#D96814"},
        {"color": "#FEA329"},
        {"color": "#FECE6D"},
        {"color": "#FEF7A5"},

        //purple
        {"color": "#511483"},
        {"color": "#74479B"},
        {"color": "#9F74B3"},
        {"color": "#C090BE"},
        {"color": "#D4AEC2"},
        {"color": "#E6C7CA"},
        {"color": "#FCE3D7"},

        //green
        {"color": "#005A32"},
        {"color": "#238444"},
        {"color": "#41AB5D"},
        {"color": "#78C678"},
        {"color": "#ADDD8E"},
        {"color": "#D9F0A3"},
        {"color": "#FFFFCC"},

        //blue
        {"color": "#084594"},
        {"color": "#2171B6"},
        {"color": "#4292C7"},
        {"color": "#6BAED6"},
        {"color": "#9ECAE1"},
        {"color": "#C6DBEF"},
        {"color": "#EFF3FF"},

        //red
        {"color": "#99000D"},
        {"color": "#CB181E"},
        {"color": "#EF3B2C"},
        {"color": "#FB6A4A"},
        {"color": "#FC9272"},
        {"color": "#FCBBA1"},
        {"color": "#FEE5D9"}

      ];
      return colors;
    }

  });

})();