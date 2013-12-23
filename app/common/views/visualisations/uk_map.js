define([
  'extensions/views/graph/graph',
  'extensions/views/view',
  'topojson',
  'uk_countries'
],
function (Graph, View, topojson, uk_countries) {
  var UkMap = Graph.extend({

    initialize: function (options) {
      //create svg in here
      this.prepareGraphArea();
      //this should be taken care of elsewhere
      this.$el.appendTo($('.uk-map'));
    },

    renderContent: function(map) {

      //data
      var subunits = topojson.feature(map, map.objects.subunits);

      //projection
      var projection = d3.geo.albers()
          .center([0, 55.4])
          .rotate([4.4, 0])
          .parallels([50, 60])
          .scale(6000)
          .translate([this.width / 2, this.height / 2]);

      //path
      var path = d3.geo.path()
        .projection(projection);

      //render
    /*svg.append("path")*/
    /*.datum(subunits)*/
      /*.attr("d", path);*/

      //render and
      //subunit classes for styling
      this.svg.selectAll(".subunit")
          .data(topojson.feature(map, map.objects.subunits).features)
        .enter().append("path")
          .attr("class", function(d) { 
            return "subunit " + d.id; 
          })
          .attr("d", path);

      //borders
      this.svg.append("path")
        .datum(topojson.mesh(map, map.objects.subunits, function(a, b) { return a !== b && a.id !== "IRL"; }))
        .attr("d", path)
        .attr("class", "subunit-boundary");

      //borders ireland
      this.svg.append("path")
        .datum(topojson.mesh(map, map.objects.subunits, function(a, b) { return a === b && a.id === "IRL"; }))
        .attr("d", path)
        .attr("class", "subunit-boundary IRL");

      //places
      //filtered when json created
      this.svg.append("path")
        .datum(topojson.feature(map, map.objects.places))
        .attr("d", path)
        .attr("class", "place");

      //labels
      //transform gets position
      this.svg.selectAll(".place-label")
        .data(topojson.feature(map, map.objects.places).features)
      .enter().append("text")
        .attr("class", "place-label")
        .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.properties.name; });

      //right-aligned labels on the left side of the map, and left-aligned labels on the right side of the map, here using 1°W as the threshold
      this.svg.selectAll(".place-label")
          .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
          .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; });

      //countries
      this.svg.selectAll(".subunit-label")
          .data(topojson.feature(map, map.objects.subunits).features)
        .enter().append("text")
          .attr("class", function(d) { return "subunit-label " + d.id; })
          .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .text(function(d) { return d.properties.name; });

      //colours
      d3.select(".subunit.SCT").style('fill', '#ddc');
      d3.select(".subunit.WLS").style('fill', '#cdd');
      d3.select(".subunit.NIR").style('fill', '#cdc');
      d3.select(".subunit.ENG").style('fill', '#dcd');
      d3.select(".subunit.IRL").style('display', 'none');
    },

    width: 960,

    height: 1160,

    //create svg
    renderSvg: function () {
      this.svg
        .attr("width", this.width)
        .attr("height", this.height);
    },

    render: function () {
      if (isServer) {
        return;
      }

      //do this later with graph parent class to get axis, labels etc if needed
      View.prototype.render.apply(this, arguments);
      
      /*d3.json("uk.json", function(error, uk) {*/
      /*});*/

      this.renderSvg();
      this.renderContent(uk_countries);
    }


//    initialize: function (options) {
//      Graph.prototype.initialize.apply(this, arguments);
//      if (this.model && this.model.get('value-attr')) {
//        this.valueAttr = this.model.get('value-attr');
//      }
//    },
//
//    interactiveFunction: function (e) {
//      if (this.graph.lineLabelOnTop()) {
//        return e.slice >= 3;
//      } else {
//        return e.slice % 3 !== 2;
//      }
//    },
//    
//    components: function () {
//      var labelComponent, labelOptions, stackOptions;
//
//      if (this.showLineLabels()) {
//        labelComponent = this.sharedComponents.linelabel;
//        labelOptions = {
//          showValues: true,
//          showValuesPercentage: true,
//          showSummary: true,
//          showTimePeriod: true,
//          attachLinks: this.model.get('line-label-links')
//        };
//        stackOptions = {
//          selectGroup: false,
//          allowMissingData: true,
//          drawCursorLine: true,
//          interactive: this.interactiveFunction
//        };
//      } else {
//        labelComponent = this.sharedComponents.callout;
//      }
//
//      return [
//        { view: this.sharedComponents.xaxis },
//        { view: this.sharedComponents.yaxis },
//        { view: this.sharedComponents.stack, options: stackOptions },
//        { view: labelComponent, options: labelOptions },
//        { view: this.sharedComponents.hover }
//      ];
//    },
//
//    getConfigNames: function () {
//      return ['stack', this.collection.query.get('period') || 'week'];
//    }
  });
  
  return UkMap;
});