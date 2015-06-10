'use strict';

(function (){
    var querySelector = document.querySelector.bind(document);
    var moneySaved = querySelector('.total_data');

    // Scales for drawing the outer circle.
    var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
    var gaugeCircleY = d3.scale.linear().range([0,50]).domain([0,50]);

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
    }

    var count = 0;
    var goal = 7525.15;
    function animateMoneySaved (){
    
        setTimeout(function (){
            if(count === goal) return;

            if(count >= goal) {
                count = goal;
            } 

            moneySaved.innerHTML = '$' + count.toFixed(2);
            count += 10.05;

            animateMoneySaved();
        }, 10);
    }

    animateMoneySaved();
    makeMoneySVGArc('savings_iconheader--svg', '#0b9160');
    makeMoneySVGArc('savings_price--svg', '#d36c07');
    makeMoneySVGArc('savings_total--svg', '#d36c07');
})();