function draw(data) {

  const GRAPH_TITLE = 'Prosper Marketplace Quarterly Loan Originations on the 36-month Loans';
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;
  const MARGIN = {top: 120, right: 50, bottom: 100, left: 100};
  const GRAPH_WIDTH = CANVAS_WIDTH - MARGIN.right - MARGIN.left;
  const GRAPH_HEIGHT = CANVAS_HEIGHT - MARGIN.top - MARGIN.bottom;

  const ANIMATE_DURATION = 500;
  const ANIMATE_DELAY = 20;
  const cMENU_OFF = '#f0f0f0'; // color for display menu when it's inactive
  const cMENU_ON = '#bdbdbd'; // color for diplay menu when it's active
  const FORMAT_DOUBLE = d3.format(',.2f'); // format numbers for display
  const FORMAT_NUMBER = d3.format(',.0f'); // format numbers for display

  const RISK_LEVELS = ['AA', 'A', 'B', 'C', 'D', 'E', 'HR'];
  const DISPLAY_OPTION = ['dollar', 'percent'];
  const TABLE_HEADER = ['Loan Grade', 'Count', '% Amount', '$ Amount', 'Avg Amount'];
  const COLUMN_DATA = ['count', 'percent', 'amount', 'average'];
  const MAX_YS = {}; // maximum loan amount in each loan grade
  for (i in RISK_LEVELS){
    let max = 0;
    for (p in data) {
      if (data[p][RISK_LEVELS[i]]['amount'] > max){
        max = data[p][RISK_LEVELS[i]]['amount'];
      }
    }
    MAX_YS[RISK_LEVELS[i]] = max;
  }

  // variables to control graph display
  let selectedDataDisplay = 'dollar'; // display in dollar or percentage amount.
  let selectedRiskDisplay = 0; // 0: display all risks; 1: display selected risk only.
  let selectedRisk = 'none';
  
  // process the data for barchart
  processedData = processData();
  let sumData = processedData[0]; // data dict of total loan amount in each quarter
  let stackedData = processedData[1]; // stack of loan amount by risk by quarter

  /*
    Draw the initial graph
  */

  // add title to the graph
  d3.select('body')
    .append('h2')
      .text(GRAPH_TITLE)

  // add canvas
  let canvas = d3.select('body')
    .append('svg')
    .attr('id', 'canvas')
    .attr('width', CANVAS_WIDTH)
    .attr('height',CANVAS_HEIGHT + 200);

  let g = canvas.append('g')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

  // set the scales for barchart
  let xScales = d3.scaleBand().rangeRound([0, GRAPH_WIDTH - MARGIN.right]).paddingInner(0.1);
  let yScales = d3.scaleLinear().range([GRAPH_HEIGHT, 0]);
  let zScales = d3.scaleOrdinal();

  xScales.domain(stackedData[0].map(d => d.data.period));
  yScales.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]);
  zScales.range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

  // add custom invert function for xScales
  xScales.invert = (function(){
    var domain = xScales.domain()
    var range = xScales.range()
    var scale = d3.scaleQuantize().domain(range).range(domain)
    return x => scale(x);
    })()

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

  // add x-axis label
  g.append('text')
    .attr('class', 'axis--x-label')
    .attr('transform', 'translate(' + (GRAPH_WIDTH/2) + ',' + (GRAPH_HEIGHT + 70) + ')')
    .text('loan origination quarter')

  // add y-axis
  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yScales).tickFormat(d => d/1000000))

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
        .attr('id', d => d.key)
        .attr('value', d => d.key)
        .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(d => d)
        .enter().append('rect')
          .attr('x', d => xScales(d.data.period))
          .attr('y', d => yScales(d[1]))
          .attr('height', d => yScales(d[0]) - yScales(d[1]))
          .attr('width', xScales.bandwidth())

  // add fill color animation based on loan risk level
  d3.selectAll('.risk_group')
    .transition()
    .attr('fill', d => zScales(d.key))
    .duration(ANIMATE_DURATION)
    .delay(ANIMATE_DELAY)

  /*
    Control view on whether to display data in dollar or percentage amount
  */

  let displayMenu = g.append('g')
    .attr('transform', 'translate(-10,-50)')

  displayMenu.append('text')
    .attr('x', 4)
    .attr('y', 10)
    .attr('dy', '.35em')
    .attr('pointer-events', 'none')
    .text('Display data in: ')

  let displayOptions = displayMenu.append('g')
    .selectAll('g')
    .data(DISPLAY_OPTION)
    .enter().append('g')
    .attr('transform', (d, i) => 'translate('+ (110 + 25*i) +',0)')

  displayOptions.append('rect')
    .attr('class', 'display--option-button')
    .attr('pointer-events', d => d === 'dollar' ? 'none' : 'all')
    .attr('value', d => d)
    .attr('width', 24)
    .attr('height', 19)
    .attr('fill', d => selectedDataDisplay === d ? cMENU_ON : cMENU_OFF)
    .on('click', function(d) {  // on click update display option and chart
      selectedDataDisplay = d3.select(this).attr('value');
      updateDisplayOptions();
      updateChart();
    })

  displayOptions.append('text')
    .attr('class', 'display--option-text')
    .attr('x', 4)
    .attr('y', 10)
    .attr('dy', '.35em')
    .attr('pointer-events', 'none')
    .attr('opacity', d => selectedDataDisplay === d ? 1 : 0.5)
    .style('font-weight', d => selectedDataDisplay === d ? 'bold' : 'auto')
    .text(d => d === 'dollar' ? '$' : '%')

  /*
    Add legend and control whether to display all or only a certain risk level
  */

  // add tooltip to legend
  let legendTip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  let legend = g.append('g')
    .attr('font-size', 12)
    .attr('text-anchor', 'end')

  legend.append('text')
    .text('Loan Grade')
    .attr('x', GRAPH_WIDTH)
    .style('font-weight', 'bold')
    .attr('dy', 100)
    .attr('dx', 20)

  let legendEnter = legend
    .selectAll('g')
    .data(RISK_LEVELS)
    .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => 'translate(0,' + (110 + i * 20) + ')')
      .attr('value', d => d)
      .attr('opacity', 1)
      .style('pointer-events', 'all')
      .on('mouseover', function(d) { // on mouseover display tooltip
        legendTip.transition()
          .duration(ANIMATE_DURATION)
          .style('opacity', .9);
        legendTip.html('Click for detail')
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on('mouseout', function(d) { // on mouseout hide tooltip
        legendTip.transition()
          .duration(ANIMATE_DURATION)
          .style('opacity', 0)
      })
      .on('click', function(d) { // on click update chart and legend
        selectedRiskDisplay = (selectedRiskDisplay + 1) % 2;
        selectedRisk = d3.select(this).attr('value');
        updateLegend();
        updateChart()
      })

  legendEnter.append('rect')
    .attr('x', GRAPH_WIDTH)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => zScales(d))

  legendEnter.append('text')
    .attr('x', GRAPH_WIDTH - 10)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d)

  /*
    Add a summary table, a horizontal guide line, and a label to display y value
    based on mouse interaction
  */

  // the summary table
  let tableView = canvas.append('g')
    .attr('opacity', 0)
    .attr('transform',
      'translate(' + (MARGIN.left + 120) + "," + (GRAPH_HEIGHT + MARGIN.top + MARGIN.bottom) + ")")

  tableView.append('g')
    .selectAll('text')
    .data(TABLE_HEADER).enter()
      .append('text')
      .attr('text-anchor', 'end')
      .style('font-weight', 'bold')
      .text(d => d)
      .attr('x', (d,i) => 100+i*120)

  tableView.append('g')
    .attr('id', 'table--body')
    .selectAll('g')
    .data(RISK_LEVELS).enter()
      .append('g')
      .attr('class', 'table--rows')
      .selectAll('text')
      .data(TABLE_HEADER).enter()
        .append('text')

  // add the mouse hover effect to the graph
  let mouseG = canvas.append('g')
    .attr('class', 'mouse_effect')

  // add a hover horizontal guide line
  mouseG.append('path')
    .attr('class', 'mouse-line mouse--line-x')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')

  // add a hover text for horizontal guide line
  mouseG.append('text')
    .attr('class', 'mouse-text')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dx', '0.3em')

  // add a hover vertical guide line
  mouseG.append('path')
    .attr('class', 'mouse-line mouse--line-y')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')

  // add a rectangle over the graph as the mouse event listener
  mouseG.append('rect')
    .attr('width', GRAPH_WIDTH - MARGIN.right)
    .attr('height', GRAPH_HEIGHT)
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() { // on mouse out hide lines and text
      d3.selectAll('.mouse-line')
        .style('opacity', '0');
      d3.select('.mouse-text')
        .style('opacity', '0');
      tableView.attr('opacity', 0);
      d3.select('.axis--x')
        .selectAll('.tick')
        .attr('font-weight', 'none')
    })
    .on('mouseover', function() { // on mouse in show lines and text
      d3.selectAll('.mouse-line')
        .style('opacity', '0.3');
      d3.select('.mouse-text')
        .style('opacity', '0.5')
    })
    .on('mousemove', function() { // mouse moving over canvas
      let mouse = d3.mouse(this);

      tableView.attr('opacity', 1);
      updateTable(xScales.invert(mouse[0])); // display a corresponding table

      d3.select('.mouse--line-x') // display hovering horizontal line
        .attr('d', function() {
          let d = 'M' + (GRAPH_WIDTH - MARGIN.right) + ',' + mouse[1];
          d += ' ' + 0 + ',' + mouse[1];
          return d;
      });

      d3.select('.mouse--line-y') // display hovering vertical line
        .attr('d', function() {
          let x = xScales(xScales.invert(mouse[0])) + 11.5;
          let d = 'M' + x + ',' + mouse[1];
          d += ' ' + x + ',' + yScales(0);
          return d;
      });

      d3.select('.mouse-text') // display hovering text
        .attr('y', d => mouse[1] - 5)
        .text(function(d) {
          if (selectedDataDisplay === 'dollar') {
            return '$' + FORMAT_DOUBLE(yScales.invert(mouse[1])/1000000) + ' million';
          }
          return FORMAT_DOUBLE(yScales.invert(mouse[1])) + ' %';
        })

      d3.select('.axis--x') // add hovering bold style to x-axis label
        .selectAll('.tick')
        .attr('font-weight', d => xScales.invert(mouse[0]) === d ? 'bold' : 'none')
    })

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

  function updateDisplayOptions() {
    /*
      Update the active and the inactive display options
    */
    d3.selectAll('.display--option-button')
      .attr('fill', d => selectedDataDisplay === d ? cMENU_ON : cMENU_OFF)
      .attr('pointer-events', d => selectedDataDisplay === d ? 'none' : 'all')

    d3.selectAll('.display--option-text')
      .style('font-weight', d => selectedDataDisplay === d ? 'bold' : 'auto')
      .attr('opacity', d => selectedDataDisplay === d ? 1 : 0.5)
  }

  function updateChart() {
    /*
      Update chart to display data in $ or % based on user selection
    */
    updateYScale();

    d3.select('.axis--y')
      .transition()
      .call(d3.axisLeft(yScales).tickFormat(d => updateYAxis(d)))
      .duration(ANIMATE_DURATION)
      .delay(ANIMATE_DELAY)

    d3.select('.axis--y-label')
      .transition()
      .text(function(d) {
        if (selectedDataDisplay === 'dollar') {
          return 'loan amount (in million USD)';
        }
        return 'loan amount (in percentage)';
      })
      .duration(ANIMATE_DURATION)
      .delay(ANIMATE_DELAY)

    d3.selectAll('.risk_group')
      .selectAll('rect')
      .transition()
      .duration(ANIMATE_DURATION)
      .delay(d => selectedRiskDisplay === 1 ? ANIMATE_DELAY + ANIMATE_DURATION : ANIMATE_DELAY)
      .attr('y', d => updateBarY(d))
      .attr('height', d => updateBarHeight(d))

    d3.selectAll('.risk_group')
      .transition()
      .duration(ANIMATE_DURATION)
      .delay(d => selectedRiskDisplay === 1 ? ANIMATE_DELAY : ANIMATE_DELAY + ANIMATE_DURATION)
      .attr('opacity', function(d) { // display which bar to show/hide
        if (selectedRiskDisplay === 1 && d3.select(this).attr('value') !== selectedRisk) {
          return 0;
        }
        return 1;
      })
  }

  function updateYScale() {
    /*
      update the y scale of the barchart based on user selection
    */
    if (selectedDataDisplay === 'percent'){
      yScales.domain([0,100]);
    } else if (selectedRiskDisplay === 1) {
        yScales.domain([0, MAX_YS[selectedRisk]]);
    }
    else {
        yScales.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]);
    }
  }

  function updateYAxis(d) { return selectedDataDisplay === 'dollar' ? d/1000000 : d; }

  function updateBarY(d) {
    /*
      update the y attribute of the barchart based on user selection
    */
    let y0 = d[0];
    let y1 = d[1];

    if (selectedDataDisplay === 'percent' && sumData[d.data.period] !== 0) {
        y0 = y0/sumData[d.data.period] * 100;
        y1 = y1/sumData[d.data.period] * 100;
    }
    return selectedRiskDisplay === 1 ? yScales(y1 - y0) : yScales(y1);
  }

  function updateBarHeight(d) {
    /*
      update the height attribute of the barchart based on user selection
    */
    let y0 = d[0];
    let y1 = d[1];

    if (selectedDataDisplay === 'percent' && sumData[d.data.period] !== 0) {
      y0 = y0/sumData[d.data.period] * 100;
      y1 = y1/sumData[d.data.period] * 100;
    }
    return yScales(y0) - yScales(y1);
  }

  function updateLegend() {
    /*
      update legends based on user selection
    */
    d3.selectAll('.legend')
      .transition()
      .duration(ANIMATE_DURATION)
      .delay(ANIMATE_DELAY)
      .attr('opacity', function(d) {
        if (selectedRiskDisplay === 1 && d3.select(this).attr('value') !== selectedRisk) {
          return 0;
        }
        return 1;
      })
      .style('pointer-events', function(d) {
        if(selectedRiskDisplay === 1 && d3.select(this).attr('value') !== selectedRisk) {
          return 'none';
        }
        return 'all';
      })
      // control legend position
      .attr('transform', function(d, i) {
        if (selectedRiskDisplay === 1) {
          return 'translate(0,' + 110 + ')';
        }
        return 'translate(0,' + (110 + i * 20) + ')';
      })
  }

  function updateTable(period) {
    /*
      update table content based on mouse position
    */
    let tData = processTableData(period);

    d3.select('#table--body').selectAll('.table--rows')
      .data(tData)
      .exit().remove()

    d3.select('#table--body').selectAll('.table--rows')
      .data(tData).enter()
        .append('g')
        .attr('class', 'table--rows')
        .selectAll('text')
        .data(d => d).enter()
          .append('text')

    d3.selectAll('.table--rows')
      .data(tData)
      .attr('transform', (d,i) => 'translate(0,' + 20*(i+1) + ")")
      .attr('font-weight', d => d[0].risk === 'Total' ? 'bold' : 'auto')
      .selectAll('text')
        .data(d => d)
        .attr('class', (d,i) => 'table--cells table--cells-' + i)
        .attr('x', (d,i) => 100+i*120)
        .text(function(d, i) {
          if( i === 0) {
            return Object.values(d);
          } else if (Object.keys(d)[0] === 'percent'){
            return FORMAT_DOUBLE(Object.values(d));
          } else {
            return FORMAT_NUMBER(Object.values(d));
          }
        })
        .attr('font-weight', function(d,i) {
          if (i === 0 ){
            return 'bold';
          } else if (Object.values(d)[0] ===
            d3.max(tData.slice(1,8), d => d[i][COLUMN_DATA[i-1]])) { return 'bold'; }
        })
  }

  function processTableData(period) {
    /*
      Process data for table display.
      Returns:
        An array of array consists of loan count, percent amount, dollar amount,
        and average amount for each period selection.
    */
    let flatTable = [];
    let riskSelection = selectedRiskDisplay === 0? RISK_LEVELS : [selectedRisk];
    let totalCount = 0;
    let totalPercent = sumData[period] === 0 ? 0 : 100;
    let totalAmount = 0;
    let totalAverage = 0;

    for (i in riskSelection) {
      let risk = riskSelection[i];
      let fData = [];

      totalCount += data[period][risk].count;
      totalAmount += data[period][risk].amount;

      fData.push({risk: risk});
      fData.push({count: data[period][risk].count});
      fData.push({percent: sumData[period] === 0 ? 0 : data[period][risk].amount/sumData[period]*100});
      fData.push({amount: data[period][risk].amount});
      fData.push({average: data[period][risk].count === 0 ? 
        0 : data[period][risk].amount/data[period][risk].count});

      flatTable.push(fData);
    }

    totalAverage = totalCount === 0 ? 0 : totalAmount/totalCount;

    if (riskSelection.length !== 1) {
      flatTable.unshift([{risk: 'all'},
      {count: totalCount},
      {percent: totalPercent},
      {amount: totalAmount},
      {average: totalAverage}])
    }

    return flatTable;
  }
};