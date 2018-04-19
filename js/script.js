function draw(data) {

  const GRAPH_TITLE = 'Prosper Marketplace Quarterly Loan Originations on the 36-month Loans';
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;
  const MARGIN = {top: 120, right: 50, bottom: 100, left: 100};
  const GRAPH_WIDTH = CANVAS_WIDTH - MARGIN.right - MARGIN.left;
  const GRAPH_HEIGHT = CANVAS_HEIGHT - MARGIN.top - MARGIN.bottom;

  const ANIMATE_DURATION = 500;
  const ANIMATE_DELAY = 20;

  const RISK_LEVELS = ['AA', 'A', 'B', 'C', 'D', 'E', 'HR'];
  
  // process the data for barchart
  processedData = processData();
  let sumData = processedData[0]; // data dict of total loan amount in each quarter
  let stackedData = processedData[1]; // stack of loan amount by risk by quarter

  debugger;

  /*
    Draw the initial graph
  */

  // add title to the graph
  d3.select('body')
    .append('h2')
      .text(GRAPH_TITLE);

  let canvas = d3.select('body')
    .append('svg')
    .attr('id', 'canvas')
    .attr('width', CANVAS_WIDTH)
    .attr('height',CANVAS_HEIGHT);

  let g = canvas.append('g')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

  // set the scales for barchart
  let xScales = d3.scaleBand().rangeRound([0, GRAPH_WIDTH - MARGIN.right]).paddingInner(0.1);
  let yScales = d3.scaleLinear().range([GRAPH_HEIGHT, 0]);
  let zScales = d3.scaleOrdinal();

  xScales.domain(stackedData[0].map(function(d) { return d.data.period; }));
  yScales.domain([0, d3.max(stackedData[stackedData.length - 1], function(d) { return d[1]; })]);
  zScales.range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

  // add x-axis
  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + GRAPH_HEIGHT + ')')
    .call(d3.axisBottom(xScales).tickFormat(function(d) {
      return d.substring(5, 7) === 'Q1' ? d : d.substring(5, 7);
    }))
    .selectAll('text')
      .attr('dx', '-.8em')
      .attr('dy', '-.4em')
      .attr('transform', 'rotate(-60)')
      .on('mouseover', function (d) {
        console.log(d);
      })

  // add x-axis label
  g.append('text')
    .attr('class', 'axis--x-label')
    .attr('transform', 'translate(' + (GRAPH_WIDTH/2) + ',' + (GRAPH_HEIGHT + 70) + ')')
    .text('loan origination quarter')

  // add y-axis
  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yScales).tickFormat(function(d) { return d/1000000; }))

  // add y-axis label
  g.append('text')
    .attr('class', 'axis--y-label')
    .attr('transform', 'translate( -35,' + (GRAPH_HEIGHT + MARGIN.bottom)/2 + ') rotate(-90)')
    .text('loan amount (in million USD)')

  // add stacked barchart
  g.append('g')
    .selectAll('g')
    .data(stackedData)
      .enter().append('g')
        .attr('class', 'risk_group')
        .attr('id', function(d) { return d.key; })
        .attr('value', function(d) { return d.key; })
        .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(function(d) { return d; })
        .enter().append('rect')
          .attr('x', function(d) { return xScales(d.data.period); })
          .attr('y', function(d) { return yScales(d[1]); })
          .attr('height', function(d) { return yScales(d[0]) - yScales(d[1]); })
          .attr('width', xScales.bandwidth())
          .on('mouseover', function(d){ console.log('mouseover'); })

  // add fill color animation based on loan risk level
  d3.selectAll('.risk_group')
    .transition()
    .attr('fill', function(d) { return zScales(d.key)})
    .duration(ANIMATE_DURATION)
    .delay(ANIMATE_DELAY)

  /*
    Functions
  */

  function processData() {
    /*
      Process data into a stack and a sum array
      Returns:
          An array of a stacked data and a sum array
    */
    let flatData = [];
    let keys = [];
    let dataSum = {};

    for (period in data) {
      let item = {};
      item.period = period;
      dataSum[period] = 0;
      for (risk in data[period]) {
        dataSum[period] += data[period][risk]['amount'];
        item[risk] = data[period][risk]['amount'];
      }
      flatData.push(item);
    }

    RISK_LEVELS.reverse(); // reverse order to stack HR loan on the bottom of the chart
    let stack = d3.stack()
      .keys(RISK_LEVELS)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    RISK_LEVELS.reverse(); // reverse back to previous order

    return [dataSum, stack(flatData)];
  };
};