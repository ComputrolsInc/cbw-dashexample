'use strict';

(function (){
    var querySelector = document.querySelector.bind(document);

    var navigation = querySelector('.dash_interchanging--nav');
    var navigationCampus = querySelector('#interchanging_nav--campus');
    var navigationReduction = querySelector('#interchanging_nav--reduction');
    var navigationConsumption = querySelector('#interchanging_nav--consumption');

    function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
      var legendWidth  = 200,
          legendHeight = 100;

      // clipping to make sure nothing appears behind legend
      svg.append('clipPath')
        .attr('id', 'axes-clip')
        .append('polygon')
          .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                          (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                          (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                          (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                          (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                          (-margin.left)                 + ',' + (chartHeight + margin.bottom));

      var axes = svg.append('g')
        .attr('clip-path', 'url(#axes-clip)');

      axes.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);

      axes.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Time (s)');

      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');

      legend.append('rect')
        .attr('class', 'legend-bg')
        .attr('width',  legendWidth)
        .attr('height', legendHeight);

      legend.append('rect')
        .attr('class', 'outer')
        .attr('width',  75)
        .attr('height', 20)
        .attr('x', 10)
        .attr('y', 10);

      legend.append('text')
        .attr('x', 115)
        .attr('y', 25)
        .text('5% - 95%');

      legend.append('rect')
        .attr('class', 'inner')
        .attr('width',  75)
        .attr('height', 20)
        .attr('x', 10)
        .attr('y', 40);

      legend.append('text')
        .attr('x', 115)
        .attr('y', 55)
        .text('25% - 75%');

      legend.append('path')
        .attr('class', 'median-line')
        .attr('d', 'M10,80L85,80');

      legend.append('text')
        .attr('x', 115)
        .attr('y', 85)
        .text('Median');
    }

    function drawPaths (svg, data, x, y) {
      var upperOuterArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct95); })
        .y1(function (d) { return y(d.pct75); });

      var upperInnerArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct75); })
        .y1(function (d) { return y(d.pct50); });

      var medianLine = d3.svg.line()
        .interpolate('basis')
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.pct50); });

      var lowerInnerArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct50); })
        .y1(function (d) { return y(d.pct25); });

      var lowerOuterArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct25); })
        .y1(function (d) { return y(d.pct05); });

      svg.datum(data);

      svg.append('path')
        .attr('class', 'area upper outer')
        .attr('d', upperOuterArea)
        .attr('clip-path', 'url(#rect-clip)');

      svg.append('path')
        .attr('class', 'area lower outer')
        .attr('d', lowerOuterArea)
        .attr('clip-path', 'url(#rect-clip)');

      svg.append('path')
        .attr('class', 'area upper inner')
        .attr('d', upperInnerArea)
        .attr('clip-path', 'url(#rect-clip)');

      svg.append('path')
        .attr('class', 'area lower inner')
        .attr('d', lowerInnerArea)
        .attr('clip-path', 'url(#rect-clip)');

      svg.append('path')
        .attr('class', 'median-line')
        .attr('d', medianLine)
        .attr('clip-path', 'url(#rect-clip)');
    }

    function addMarker (marker, svg, chartHeight, x) {
      var radius = 32,
          xPos = x(marker.date) - radius - 3,
          yPosStart = chartHeight - radius - 3,
          yPosEnd = (marker.type === 'Client' ? 80 : 160) + radius - 3;

      var markerG = svg.append('g')
        .attr('class', 'marker '+marker.type.toLowerCase())
        .attr('transform', 'translate(' + xPos + ', ' + yPosStart + ')')
        .attr('opacity', 0);

      markerG.transition()
        .duration(1000)
        .attr('transform', 'translate(' + xPos + ', ' + yPosEnd + ')')
        .attr('opacity', 1);

      markerG.append('path')
        .attr('d', 'M' + radius + ',' + (chartHeight-yPosStart) + 'L' + radius + ',' + (chartHeight-yPosStart))
        .transition()
          .duration(1000)
          .attr('d', 'M' + radius + ',' + (chartHeight-yPosEnd) + 'L' + radius + ',' + (radius*2));

      markerG.append('circle')
        .attr('class', 'marker-bg')
        .attr('cx', radius)
        .attr('cy', radius)
        .attr('r', radius);

      markerG.append('text')
        .attr('x', radius)
        .attr('y', radius*0.9)
        .text(marker.type);

      markerG.append('text')
        .attr('x', radius)
        .attr('y', radius*1.5)
        .text(marker.version);
    }

    function startTransitions (svg, chartWidth, chartHeight, rectClip, markers, x) {
      rectClip.transition()
        .duration(1000*markers.length)
        .attr('width', chartWidth);

      markers.forEach(function (marker, i) {
        setTimeout(function () {
          addMarker(marker, svg, chartHeight, x);
        }, 1000 + 500*i);
      });
    }

    function makeChart (data, markers) {
      var svgWidth  = 960,
          svgHeight = 500,
          margin = { top: 20, right: 20, bottom: 40, left: 40 },
          chartWidth  = svgWidth  - margin.left - margin.right,
          chartHeight = svgHeight - margin.top  - margin.bottom;

      var x = d3.time.scale().range([0, chartWidth])
                .domain(d3.extent(data, function (d) { return d.date; })),
          y = d3.scale.linear().range([chartHeight, 0])
                .domain([0, d3.max(data, function (d) { return d.pct95; })]);

      var xAxis = d3.svg.axis().scale(x).orient('bottom')
                    .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
          yAxis = d3.svg.axis().scale(y).orient('left')
                    .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

      var svg = d3.select('#container_svg')
        .attr('class', 'linechart')
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // clipping to start chart hidden and slide it in later
      var rectClip = svg.append('clipPath')
        .attr('id', 'rect-clip')
        .append('rect')
          .attr('width', 0)
          .attr('height', chartHeight);

      addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
      drawPaths(svg, data, x, y);
      startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);
    }

    // var parseDate  = d3.time.format('%Y-%m-%d').parse;
    // d3.json('monthsdata.json', function (error, rawData) {
    //   if (error) {
    //     console.error(error);
    //     return;
    //   }

    //   var data = rawData.map(function (d) {
    //     return {
    //       date:  parseDate(d.date),
    //       pct05: d.pct05 / 1000,
    //       pct25: d.pct25 / 1000,
    //       pct50: d.pct50 / 1000,
    //       pct75: d.pct75 / 1000,
    //       pct95: d.pct95 / 1000
    //     };
    //   });

    //   d3.json('markers.json', function (error, markerData) {
    //     if (error) {
    //       console.error(error);
    //       return;
    //     }

    //     var markers = markerData.map(function (marker) {
    //       return {
    //         date: parseDate(marker.date),
    //         type: marker.type,
    //         version: marker.version
    //       };
    //     });

    //     makeChart(data, markers);
    //   });
    // });

    // LIQUID FILL GAUGE
    var liquidConfig = liquidFillGaugeDefaultSettings();
    liquidConfig.circleColor = "#2296bb";
    liquidConfig.waveColor = "#2296bb";
    liquidConfig.waveAnimateTime = 1000;
    loadLiquidFillGauge('fillgauge', 55, liquidConfig);

    // Scales for drawing the outer circle.
    var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
    var gaugeCircleY = d3.scale.linear().range([0,50]).domain([0,50]);
    
    // Draw the outer circle.
    var arc = d3.svg.arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(99))
        .innerRadius(gaugeCircleY(95));

    var svg = d3.select('#greenefficiency')
        .append("g")
        .attr('transform','translate('+165+','+110+')')
        .append('g')
        .attr('class', 'green_svg--circle')
        .append('path')
        .attr('d', arc)
        .attr('fill', '#2bb673');

    var waterSvg = d3.select('#waterefficiency')
        .append("g")
        .attr('transform','translate('+165+','+110+')')
        .append('g')
        .attr('class', 'water_svg--circle')
        .append('path')
        .attr('d', arc)
        .attr('fill', '#2296bb');

    function makeMoneySVGArc(id, fill) {
        // Draw the outer circle.
        var arc = d3.svg.arc()
            .startAngle(gaugeCircleX(0))
            .endAngle(gaugeCircleX(1))
            .outerRadius(gaugeCircleY(55))
            .innerRadius(gaugeCircleY(52));

        d3.select('.' + id)
            .append("g")
            .attr('transform','translate('+160+','+80+')')
            .append('g')
            .attr('class', 'money_svg--circle')
            .append('path')
            .attr('d', arc)
            .attr('fill', fill);

            //0b9160
            //d36c07        
    }

    function makeArc(differential){

        var circleX = d3.scale.linear().range([2*Math.PI + (differential - 0.20), differential]).domain([0,1]);
        var circleY = d3.scale.linear().range([0,1]).domain([0,1]);

        // Draw the outer circle.
        return d3.svg.arc()
            .startAngle(circleX(0))
            .endAngle(circleX(1))
            .outerRadius(circleY(99))
            .innerRadius(circleY(95));
    }


    var electricSvg = d3.select('#electricefficiency')
        .append("g")
        .attr('transform','translate('+175+','+110+')')
        .append('g').attr('class', 'electric_svg--circle');

    var electricArc = electricSvg.append('path')
        .attr('d', makeArc(1))
        .attr('fill', '#eaba49');
    
    var counter = 1;
    function animateArc() {
        electricArc.transition()
            .duration(300)
            .ease('linear')
            .attr('d', makeArc(counter))
            .each("end", function(){
                if(counter > 50) counter = 2;
                counter+= 0.05;
                // electricArc.attr('d', makeArc(1));
                animateArc();
            });
    }

    function makeKwMeter(){
        // Green Meter
        var greenMeter = { 
            width: 50, 
            height: 75,
            margin: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        };
        var meterX = d3.scale.ordinal()
            .rangeRoundBands([0, greenMeter.width], .25);

        var meterY = d3.scale.linear()
            .range([greenMeter.height, 0]);

        var meterXAxis = d3.svg.axis()
            .scale(meterX)
            .orient('bottom');

        var meterYAxis = d3.svg.axis()
            .scale(meterY)
            .orient('left');

        var greenMeterSvg = d3.select('.usage_meta--efficiency')
                .attr("width", greenMeter.width + greenMeter.margin.left + greenMeter.margin.right)
                .attr("height", greenMeter.height + greenMeter.margin.top + greenMeter.margin.bottom)
            .append("g")
                .attr("transform", "translate(" + greenMeter.margin.left + "," + greenMeter.margin.top + ")");

        meterX.domain(['Efficiency']);
        meterY.domain([ 0, 2000000]);

        greenMeterSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + greenMeter.height + ")")
            .call(meterXAxis);

        greenMeterSvg.append("g")
            .attr("class", "y axis")
            .call(meterYAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Efficiency");

        var bar = greenMeterSvg.selectAll(".usage_meta--bar");
        bar.append('rect')
            .attr('class', 'usage_meta--bar-green')
            .attr('x', function(){ return meterX(0); })
            .attr('width', meterX.rangeBand())
            .attr('y', function(){ return meterY(1064200) })
            .attr('fill', 'green')
            .attr('height', function(d){ 
                return greenMeter.height - meterY(1064200);
            });

        bar.append('rect')
            .attr('class', 'usage_meta--bar-caution')
            .attr('x', function(d){ return meterX(0); })
            .attr('width', meterX.rangeBand())
            .attr('y', function(d){ return meterY(1500000) })
            .attr('fill', 'orange')
            .attr('height', function(d){ 
                return greenMeter.height - meterY(1500000);
            });

        bar.append('rect')
            .attr('class', 'usage_meta--bar-bad')
            .attr('x', function(d){ return meterX(0); })
            .attr('width', meterX.rangeBand())
            .attr('y', function(d){ return meterY(2000000) })
            .attr('fill', 'red')
            .attr('height', function(d){ 
                return greenMeter.height - (meterY(2000000) - meterY(1500000) - meterY(1064200));
            });
    }

    function BuildUseageChart(){
        var margin = {top: 40, right: 10, bottom: 30, left: 85},
            width = 500 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .25);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var line = d3.svg.line()
            .x(function (d) {return x(d.hour)})
            .y(function (d) {return d.current ? y(d.current) : y(d.max)});

        var svg = d3.select('.usage_chart--actual')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // var rectClip = svg.append('clipPath')
        //         .attr('id', 'usage-clip')
        //     .append('rect')
        //         .attr('width', 0)
        //         .attr('height', height);

        d3.json('consumption.json', function(error, data) {
          x.domain(data.map(function(d) { return d.hour; }));
          y.domain([d3.min(data, function (d) { 
                if(d.current){
                    var lesser = d.current < d.consumption ? d.current : d.consumption;

                    var mod = Math.round(lesser / 100000);

                    return mod > 0 ? Math.floor(mod * 100000) : 0;
                }

                return d.min;
            }), d3.max(data, function(d) { return d.max })]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("kWh Consumed");

            var bars = svg.selectAll(".usage_chart--bar").data(data).enter();
            bars.append('rect')
                .attr('class', function (d) { return 'usage_chart--bar ' + d.hour })
                .attr('x', function(d){ return x(d.hour); })
                .attr('width', x.rangeBand())
                .attr('y', function(d){ return y(d.consumption) })
                .attr('height', function(d){ 
                    return height - y(d.consumption);
                })
                //TODO(BRYCE) - ADD DESCRIPTION ON HOVER
                // .on("mouseover", function(d){ d3.select()})
                // .attr('clip-path', 'url(#rect-clip)');

            // Line draw
            var lineGroup = svg.append('g')
                .attr('transform', 'translate(20, 0)');

            var linePath = lineGroup.append('path')
                .datum(data)
                .attr('class', 'usage_chart--line')
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', '1.5px')
                .attr('marker-start', 'url(#markerCircle)')
                .attr('marker-mid', 'url(#markerCircle)')
                .attr('marker-end', 'url(#endMarker)');

            var goalLine = d3.svg.line()
                .x(function (d) {return x(d.hour)})
                .y(function (d) {return y(100000)});

            lineGroup.append('line')
                .attr('fill', 'none')
                .attr('stroke', 'green')
                .attr('stroke-dasharray', '15, 15')
                .attr('stroke-width', '3px')
                .attr('x1', function () { return x('0')})
                .attr('x2', function () {return x('2PM')})
                .attr('y1', function () {return y(1064200)})
                .attr('y2', function () {return y(1064200)})
                .attr('dx', function () {return '100'});
  
        });

        var metaMeter = d3.select('#usage_meta--meter')
            .append("g")
            .attr('transform','translate('+175+','+110+')')
            .append('g').attr('class', 'usage_meta--circle');

        var metaMeterArc = metaMeter.append('path')
            .attr('d', makeArc(1))
            .attr('fill', '#eaba49');

        var consumptionMarker = d3.select('#currentConsumption');
        function animateCurrent (){
            consumptionMarker.transition()
                .ease('linear')
                .duration(500)
                .attr('r', 5)
                .each('end', function (){
                    // console.log('here');
                    consumptionMarker.attr('r', 2);

                    animateCurrent();
                });
        }

        var count = 1;
        function animateMeter (){
            metaMeterArc.transition()
                .duration(100)
                .ease('linear')
                .attr('d', makeArc(count))
                .each("end", function(){
                    if(count > 50) count = 2;
                    count+= 0.05;
                    animateMeter();
                });
        }

        animateMeter();
        animateCurrent();
        makeKwMeter()
    }

    function init(){
        navigation.addEventListener('click', function (e){
            var el = e.target;

            switch(el.id) {
                case 'interchanging_nav--campus':
                case 'icon_campus': 
                    if(!navigationCampus.classList.contains('active')){
                        navigationCampus.classList.add('active');
                    }

                    navigationReduction.classList.remove('active');
                    navigationConsumption.classList.remove('active');

                    // TODO(BRYCE) Build campus chart
                    break;

                case 'interchanging_nav--reduction':
                case 'icon_reduction':

                    if(!navigationReduction.classList.contains('active')){
                        navigationReduction.classList.add('active')
                    }

                    navigationCampus.classList.remove('active');
                    navigationConsumption.classList.remove('active');

                    // TODO(BRYCE) BUILD REDUCTION CHART
                    break;
                case 'interchanging_nav--consumption':
                case 'icon_consumption':
                    if(!navigationConsumption.classList.contains('active')){
                        navigationConsumption.classList.add('active')
                    }

                    navigationCampus.classList.remove('active');
                    navigationReduction.classList.remove('active');

                    BuildUseageChart()
                    break;
                default: 
                    console.log('bad case');
                    break;
            }
        });

        BuildUseageChart();
    }

    animateArc();
    makeMoneySVGArc('savings_iconheader--svg', '#0b9160');
    makeMoneySVGArc('savings_price--svg', '#d36c07');
    makeMoneySVGArc('savings_total--svg', '#d36c07');

    init();
})();