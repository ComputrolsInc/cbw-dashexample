(function (){
    var margin = {top: 40, right: 10, bottom: 30, left: 45},
        width = 825 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var barWidth = 500;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .35);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format('$'));

    var line = d3.svg.line()
        .x(function (d) {return x(d.day)})
        .y(function (d) {return y(d.last)});

    var svg = d3.select('.savings_chart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var rectClip = svg.append('clipPath')
        .attr('id', 'rect-clip')
        .append('rect')
        .attr('width', 0)
        .attr('height', height);

    d3.json('saveddata.json', function(error, data) {
      x.domain(data.map(function(d) { return d.day; }));
      y.domain([0, d3.max(data, function(d) { return d.current > d.last ? d.current + 3 : d.last + 3; })]);

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
          .text("Dollars Saved");

    var bars = svg.selectAll(".savings_svg--bar").data(data).enter();
    bars.append('rect')
        .attr('class', 'savings_svg--bar')
        .attr('x', function(d){ return x(d.day); })
        .attr('width', x.rangeBand())
        .attr('y', function(d){ return d.current < d.last ? y(d.current) : y(d.last); })
        .attr('height', function(d){ 
            return d.current < d.last ? height - y(d.current) : height - y(d.last);
        })
        .attr('clip-path', 'url(#rect-clip)');
        
    var efficiency = bars.append('g').attr('class', 'savings_svg--efficiency');
    var efficiencyBar = efficiency.append('rect')
            .attr('class', function (d){
                return d.current < d.last ? 'efficiency_bar bad' : 'efficiency_bar good';
            })
            .attr('x', function (d) { return x(d.day) })
            .attr('width', x.rangeBand())
            .attr('y', function (d) {
                return d.current < d.last ? y(d.last) : y(d.current);
            })
            .attr('height', function (d){
                return d.current < d.last ? height - y(d.last - d.current) : 
                    height - y(d.current - d.last);
            })
            .attr('clip-path', 'url(#rect-clip)');

    var efficiencyLabel = efficiency.append('text')
            .attr('class', function (d){ 
                return d.current < d.last ? 'efficiency_label bad' : 'efficiency_label good' 
            })
            .attr('x', function (d){ return x(d.day) })
            .attr('y', function (d){
                return d.current < d.last ? y(d.last + 0.75) : y(d.current + 0.75);
            })
            .attr('dy', ".71em")
            .attr('dx', function (d){
                // Center the percentages
                return x.rangeBand() * 0.10;
            })
            .text(function (d) {
                var decimals = d.current < d.last ? (d.last-d.current) / d.current : (d.current-d.last) / d.last;
                var change = d.current < d.last ? '-' : '+';
                return change + Math.round(decimals.toPrecision(2) * 100) + '%'; 
            })
            .attr('clip-path', 'url(#rect-clip)');

    // Line draw
    var lineGroup = svg.append('g')
        .attr('transform', 'translate(20, 0)')
        .append('path')
        .datum(data)
        .attr('class', 'lastMonthLine')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1.5px')
        .attr('marker-start', 'url(#markerCircle)')
        .attr('marker-mid', 'url(#markerCircle)')
        .attr('marker-end', 'url(#markerCircle)')
        .attr('clip-path', 'url(#rect-clip)');
    });

    function animateChart(){
        rectClip.transition()
            .ease('linear')
            .duration(3500)
            .attr('width', width);
    }

    animateChart();
})();