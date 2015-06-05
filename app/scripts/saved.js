(function (){
    var margin = {top: 40, right: 20, bottom: 30, left: 75},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var barWidth = 500;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .3);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format('0$'));

    var line = d3.svg.line()
        .x(function (d) {return x(d.day)})
        .y(function (d) {return y(d.last)});

    var svg = d3.select('.dash_savings--chart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json('saveddata.json', function(error, data) {
      x.domain(data.map(function(d) { return d.day; }));
      y.domain([0, d3.max(data, function(d) { return d.current > d.last ? d.current : d.last; })]);

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

    var bars = svg.selectAll(".bar").data(data).enter();

    bars.append('rect')
        .attr('class', 'savings_svg--bar')
        .attr('x', function(d){ return x(d.day); })
        .attr('width', x.rangeBand())
        .attr('y', function(d){ return d.current < d.last ? y(d.current) : y(d.last); })
        .attr('height', function(d){ 
            return d.current < d.last ? height - y(d.current) : height - y(d.last);
        });
        
    var efficiency = bars.append('g').attr('class', 'savings_svg--efficiency');
    efficiency.append('rect')
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
            });

    efficiency.append('text')
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
                return x.rangeBand() * 0.22;
            })
            .text(function (d) {
                var decimals = d.current < d.last ? (d.last-d.current) / d.current : (d.current-d.last) / d.last;
                var change = d.current < d.last ? '-' : '+';
                return change + Math.round(decimals.toPrecision(2) * 100) + '%'; 
            });

    // Line draw
    var lineGroup = svg.append('g')
        .attr('transform', 'translate(25, 0)')
        .append('path')
        .datum(data)
        .attr('class', 'lastMonthLine')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1.5px')
        .attr('marker-start', 'url(#markerCircle)')
        .attr('marker-mid', 'url(#markerCircle)')
        .attr('marker-end', 'url(#markerCircle)');
    });
})();