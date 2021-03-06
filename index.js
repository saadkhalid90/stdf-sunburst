async function readAndDraw(){
  const SB1Data = await d3.csv('SB1.csv');
  const arrOfArr = convArrOfArr(SB1Data, 'seq', 'value');
  const width = 520;
  const height = 520;

  let json = buildHierarchy(arrOfArr);

  let root = d3.hierarchy(json)
      .sum(d => d.size);

  const radius = 250;

  const colScale = d3.scaleOrdinal()
                    .domain(["Yes", "No", "Don't Know"])
                    .range([
                      d3.rgb('#02a5b2'),
                      d3.rgb('#e74153'),
                      d3.rgb('#e74153').darker()
                    ]);

  d3.select(".questionListContain")
      .selectAll('ol')
      .data([1, 2, 3])
      .style('font-weight',  300)
      .style('font-size',  '14px');

  let partition = d3.partition()  // <-- 1
    .size([2 * Math.PI, radius * radius]);

  let arcData = partition(root);

  let arc = d3.arc()  // <-- 2
    .startAngle(function (d) { return d.x0 })
    .endAngle(function (d) { return d.x1 })
    .padAngle([0.0025])
    .innerRadius(function (d) { return Math.sqrt(d.y0) })
    .outerRadius(function (d) { return Math.sqrt(d.y1) });

  const svgG = d3.select('svg.sunburst-1')
                .append('g')
                .classed('SBG', true)
                .attr('transform', `translate(${width/2}, ${height/2})`);

  svgG.selectAll('path')  // <-- 1
    .data(root.descendants())  // <-- 2
    .enter()  // <-- 3
    .append('path')  // <-- 4
    .classed('sBArc', true)
    .attr("display", function (d) { return d.depth ? null : "none"; })  // <-- 5
    .attr("d", arc)  // <-- 6
    .style('stroke', '#fff')  // <-- 7
    .style("fill", d => colScale(d.data.name));



  svgG.selectAll('path.sBArc')
      .on('mouseover', function(d, i){
        const sequenceArray = d.ancestors().reverse();
        const depth = d.depth;
        const size = d3.sum(d.leaves().map(d => d.data.size));
        sequenceArray.shift();

        console.log(d.leaves().map(d => d.data.size));

        d3.select('p.stats')
          .style('opacity', 1);

        d3.select('div.statContain')
          .select('span.numer')
          .html(d => `${size}`);

        svgG.selectAll('path.sBArc')
            .style('opacity', d => sequenceArray.includes(d) ? 1 : 0.5);

        d3.select(".questionListContain")
            .selectAll('ol')
            .style('opacity', d => d == depth ? 1 : 0.3)
            .style('font-weight',  d => d == depth ? 400 : 300)
      });

  svgG.selectAll('path.sBArc')
      .on('mouseout', function(d, i){
        svgG.selectAll('path.sBArc')
            .style('opacity',  1);

        d3.select('p.stats')
          .style('opacity', 0);

        d3.select('div.statContain')
          .select('span.numer')
          .html(``);


        d3.select(".questionListContain")
            .selectAll('ol')
            .style('opacity', 1)
            .style('font-weight',  300)
      });




      // vis.selectAll("path")
      //     .filter(function(node) {
      //               // if node exists in sequence (greater or equal to zero)
      //               return (sequenceArray.indexOf(node) >= 0);
      //             })
      //     .style("opacity", 1);

}

readAndDraw();
