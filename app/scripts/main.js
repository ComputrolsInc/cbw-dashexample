'use strict';

(function (){
    var querySelector = document.querySelector.bind(document);

    var navigation = querySelector('.dash_interchanging--nav');
    var navigationCampus = querySelector('#interchanging_nav--campus');
    var navigationReduction = querySelector('#interchanging_nav--reduction');
    var navigationConsumption = querySelector('#interchanging_nav--consumption');

    var colors = {green: '#2bb673', white: '#BCD5D5', yellow: '#eaba49', blue: '#2296bb', money: '#0b9160'};

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

    function makePercentageMeter(selector, percentage){
        // Green Meter
        var meter = { 
            width: 50, 
            height: 150,
            margin: {
                left: 50,
                right: 25,
                top: 30,
                bottom: 5
            }
        };

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, meter.width], .1);

        var y = d3.scale.linear()
            .range([meter.height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(2)
            .tickFormat(d3.format('%'));

        var svg = d3.select(selector)
                .attr("width", meter.width + meter.margin.left + meter.margin.right)
                .attr("height", meter.height + meter.margin.top + meter.margin.bottom)
            .append("g")
                .attr("transform", "translate(" + meter.margin.left + "," + meter.margin.top + ")");

        x.domain(['Reduction']);
        y.domain([ 0, 1]);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var bar = svg.selectAll('percentage-bar').data([12]).enter();
        bar.append('rect')
            .attr('class', 'percentage-bar')
            .attr('x', function(){ return x('Efficiency'); })
            .attr('width', x.rangeBand())
            .attr('y', function(){ return y(percentage / 100) })
            .attr('fill', colors.money)
            .attr('height', function(d){ 
                return meter.height - y(percentage / 100);
            });

        var lineGroup = svg.append('g')
            .attr('transform', 'translate(0, 0)');

        var currentLine = d3.svg.line()
                    .x(function (d) {return d})
                    .y(function (d) {return y(percentage / 100)});

        var startLine = d3.svg.line()
                    .x(function (d) {return d})
                    .y(function (d) {return y(0)});

        var linePath = lineGroup.append('path')
            .datum([x('Reduction') - 20, x('Reduction') + 50])
            .attr('class', 'reduction_chart--line')
            .attr('d', startLine)
            .attr('fill', 'none')
            .attr('stroke', colors.blue)
            .attr('stroke-width', '5px')
            .attr('marker-start', 'url(#marker_triangle--start)')
            .attr('marker-end', 'url(#marker_triangle--end)');

        linePath.transition()
            .ease('linear')
            .duration(3500)
            .attr('d', currentLine);      
    }

    function makeKwMeter(){
        // Green Meter
        var greenMeter = { 
            width: 50, 
            height: 150,
            margin: {
                left: 35,
                right: 25,
                top: 30,
                bottom: 10
            }
        };
        var goals = {current: 145, good: 155, caution: 170, danger: 200};
        var meterX = d3.scale.ordinal()
            .rangeRoundBands([0, greenMeter.width], .1);

        var meterY = d3.scale.linear()
            .range([greenMeter.height, 0]);

        var meterXAxis = d3.svg.axis()
            .scale(meterX)
            .orient('bottom');

        var meterYAxis = d3.svg.axis()
            .scale(meterY)
            .orient('left')
            .ticks(2)
            .tickFormat(d3.format('s'));

        var greenMeterSvg = d3.select('.usage_meta--efficiency')
                .attr("width", greenMeter.width + greenMeter.margin.left + greenMeter.margin.right)
                .attr("height", greenMeter.height + greenMeter.margin.top + greenMeter.margin.bottom)
            .append("g")
                .attr("transform", "translate(" + greenMeter.margin.left + "," + greenMeter.margin.top + ")");

        meterX.domain(['Efficiency']);
        meterY.domain([ 0, 200]);

        // greenMeterSvg.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + greenMeter.height + ")")
        //     .call(meterXAxis);

        greenMeterSvg.append("g")
            .attr("class", "y axis")
            .call(meterYAxis);

        var bar = greenMeterSvg.selectAll(".usage_meta--bar").data([1020]).enter();
        bar.append('rect')
            .attr('class', 'usage_meta--bar-green')
            .attr('x', function(){ return meterX('Efficiency'); })
            .attr('width', meterX.rangeBand())
            .attr('y', function(){ return meterY(goals.good) })
            .attr('fill', colors.money)
            .attr('height', function(d){ 
                return greenMeter.height - meterY(goals.good);
            });

        bar.append('rect')
            .attr('class', 'usage_meta--bar-caution')
            .attr('x', function(d){ return meterX('Efficiency'); })
            .attr('width', meterX.rangeBand())
            .attr('y', function(d){ return meterY(goals.caution) })
            .attr('fill', colors.yellow)
            .attr('height', function(d){ 
                return greenMeter.height - (meterY(goals.caution-goals.good));
            });

        bar.append('rect')
            .attr('class', 'usage_meta--bar-bad')
            .attr('x', function(d){ return meterX('Efficiency'); })
            .attr('width', meterX.rangeBand())
            .attr('y', function(d){ return meterY(goals.danger) })
            .attr('fill', 'red')
            .attr('height', function(d){ 
                return greenMeter.height - (meterY(goals.danger - goals.caution));
            });


        var lineGroup = greenMeterSvg.append('g')
            .attr('transform', 'translate(0, 0)');

        var currentLine = d3.svg.line()
                    .x(function (d) {return d})
                    .y(function (d) {return meterY(goals.current)});

        var startLine = d3.svg.line()
                    .x(function (d) {return d})
                    .y(function (d) {return meterY(0)});

        var linePath = lineGroup.append('path')
            .datum([meterX('Efficiency') - 10, meterX('Efficiency') + 50])
            .attr('class', 'usage_chart--line')
            .attr('d', startLine)
            .attr('fill', 'none')
            .attr('stroke', colors.blue)
            .attr('stroke-width', '5px')
            .attr('marker-start', 'url(#marker_triangle--start)')
            .attr('marker-end', 'url(#marker_triangle--end)');

        linePath.transition()
            .ease('linear')
            .duration(3500)
            .attr('d', currentLine);
    }

    function BuildUseageChart(){
        var margin = {top: 40, right: 10, bottom: 30, left: 95},
            width = 500 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

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
        
        var rectClip = svg.append('clipPath')
                .attr('id', 'usage-clip')
            .append('rect')
                .attr('width', 0)
                .attr('height', height);

        d3.json('consumption.json', function(error, data) {
          x.domain(data.map(function(d) { return d.hour; }));
          y.domain([d3.min(data, function (d) { 
                if(d.current){
                    var lesser = d.current < d.consumption ? d.current : d.consumption;

                    var mod = Math.round(lesser / 100);

                    return mod > 0 ? Math.floor(mod * 100) : 0;
                }

                return d.min;
            }), d3.max(data, function(d) { return d.max + 10 })]);

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
                .attr('clip-path', 'url(#usage-clip)');

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
                .attr('marker-end', 'url(#endMarker)')
                .attr('clip-path', 'url(#usage-clip)');

            var goalLine = d3.svg.line()
                .x(function (d) {return x(d.hour)})
                .y(function (d) {return y(145)});

            lineGroup.append('line')
                .attr('fill', 'none')
                .attr('stroke', 'green')
                .attr('stroke-dasharray', '15, 15')
                .attr('stroke-width', '3px')
                .attr('x1', function () { return x('0')})
                .attr('x2', function () {return x('2PM')})
                .attr('y1', function () {return y(145)})
                .attr('y2', function () {return y(145)})
                .attr('dx', function () {return '100'})
                .attr('clip-path', 'url(#usage-clip)');

            lineGroup.append('line')
                .attr('fill', 'none')
                .attr('stroke', colors.yellow)
                .attr('stroke-dasharray', '15, 15')
                .attr('stroke-width', '3px')
                .attr('x1', function () { return x('0')})
                .attr('x2', function () {return x('2PM')})
                .attr('y1', function () {return y(165)})
                .attr('y2', function () {return y(165)})
                .attr('dx', function () {return '100'})
                .attr('clip-path', 'url(#usage-clip)');
        });

        var metaMeter = d3.select('#usage_meta--meter')
            .append("g")
            .attr('transform','translate('+175+','+110+')')
            .append('g').attr('class', 'usage_meta--circle');

        var metaMeterArc = metaMeter.append('path')
            .attr('d', makeArc(1))
            .attr('fill', '#eaba49');

        function animateChart(){
            rectClip.transition()
                .ease('linear')
                .duration(3500)
                .attr('width', width);
        }

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
                    count+= 0.04;
                    animateMeter();
                });
        }

        animateChart();
        animateMeter();
        animateCurrent();
        makeKwMeter()
    }

    function BuildReductionMeters(){
        makePercentageMeter('.reduction_metrics--lastmonth', 35);
        makePercentageMeter('.reduction_metrics--thismonth', 55);
    }

    function init(){
        var reductionContainer = querySelector('.interchanging_data--reduction');
        var campusContainer = querySelector('.interchanging_data--campus');
        var usageContainer = querySelector('.interchanging_data--usage');

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

                    reductionContainer.style.display = 'none';
                    campusContainer.style.display = 'block';
                    usageContainer.style.display = 'none';
                    break;

                case 'interchanging_nav--reduction':
                case 'icon_reduction':

                    if(!navigationReduction.classList.contains('active')){
                        navigationReduction.classList.add('active')
                    }

                    navigationCampus.classList.remove('active');
                    navigationConsumption.classList.remove('active');

                    reductionContainer.style.display = 'block';
                    campusContainer.style.display = 'none';
                    usageContainer.style.display = 'none';
                    break;
                case 'interchanging_nav--consumption':
                case 'icon_consumption':
                    if(!navigationConsumption.classList.contains('active')){
                        navigationConsumption.classList.add('active')
                    }

                    navigationCampus.classList.remove('active');
                    navigationReduction.classList.remove('active');

                    // querySelector('.usage_chart--actual').innerHtml = '<div></div>';
                    // querySelector('#usage_meta--meter').innerHtml = '<div></div>';
                    // querySelector('.usage_meta--efficiency').innerHtml = '<div></div>';
                    
                    // BuildUseageChart()
                    reductionContainer.style.display = 'none';
                    campusContainer.style.display = 'none';
                    usageContainer.style.display = 'block';
                    break;
                default: 
                    console.log('bad case');
                    break;
            }
        });
    
        BuildReductionMeters();
        BuildUseageChart();
    }

    animateArc();

    init();
})();