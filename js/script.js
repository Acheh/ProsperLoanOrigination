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
  const FORMAT_NUMBER = d3.format(',.2f'); // format numbers for display

  const RISK_LEVELS = ['AA', 'A', 'B', 'C', 'D', 'E', 'HR'];
  const DISPLAY_OPTION = ['dollar', 'percent'];
  const MAX_YS = {};
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

  // add fill color animation based on loan risk level
  d3.selectAll('.risk_group')
    .transition()
    .attr('fill', function(d) { return zScales(d.key)})
    .duration(ANIMATE_DURATION)
    .delay(ANIMATE_DELAY)

  /*
    Control view on whether to display data in dollar or percentage amount
  */
  let displayMenu = g.append('g')
    .attr('transform', function () { return 'translate(-10,-50)'; })

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
    .attr('transform', function (d, i) { return 'translate('+ (110 + 25*i) +',0)'; })

  displayOptions.append('rect')
    .attr('class', 'display--option-button')
    .attr('pointer-events', function(d) { return d === 'dollar' ? 'none' : 'all'; })
    .attr('value', function(d) {return d;})
    .attr('width', 24)
    .attr('height', 19)
    .attr('fill', function(d) { return selectedDataDisplay === d ? cMENU_ON : cMENU_OFF; })
    .on('click', function(d) {
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
    .attr('opacity', function(d) { return selectedDataDisplay === d ? 1 : 0.5; })
    .style('font-weight', function(d) { return selectedDataDisplay === d ? 'bold' : 'auto'; })
    .text(function(d) { return d === 'dollar' ? '$' : '%'; });

  /*
    Add legend and control whether to display all or only a certain risk level
  */
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
      .attr('transform', function (d, i) { return 'translate(0,' + (110 + i * 20) + ')'; })
      .attr('value', function(d) { return d; })
      .attr('opacity', 1)
      .style('pointer-events', 'all')
      .on('click', function(d) {
        selectedRiskDisplay = (selectedRiskDisplay + 1) % 2;
        selectedRisk = d3.select(this).attr('value');
        updateLegend();
        updateChart()
      })

  legendEnter.append('rect')
    .attr('x', GRAPH_WIDTH)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', function(d) { return zScales(d)})

  legendEnter.append('text')
    .attr('x', GRAPH_WIDTH - 10)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d)

  /*
    Add a horizontal guide line and a label to display y value
  */
  let mouseG = canvas.append('g')
    .attr('class', 'mouse_effect')

  mouseG.append('path')
    .attr('class', 'mouse-line')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')

  mouseG.append('text')
    .attr('class', 'mouse-text')
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dx', '0.3em')

  mouseG.append('rect')
    .attr('width', GRAPH_WIDTH - MARGIN.right)
    .attr('height', GRAPH_HEIGHT)
    .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() { // on mouse out hide line and text
      d3.select('.mouse-line')
        .style('opacity', '0');
      d3.select('.mouse-text')
        .style('opacity', '0')
    })
    .on('mouseover', function() { // on mouse in show line and text
      d3.select('.mouse-line')
        .style('opacity', '0.3');
      d3.select('.mouse-text')
        .style('opacity', '0.5')
    })
    .on('mousemove', function() { // mouse moving over canvas
      let mouse = d3.mouse(this);

      d3.select('.mouse-line')
        .attr('d', function() {
          let d = 'M' + (GRAPH_WIDTH - MARGIN.right) + ',' + mouse[1];
          d += ' ' + 0 + ',' + mouse[1];
          return d;
      });

      d3.select('.mouse-text')
        .attr('y', function(d) {
          return mouse[1] - 5;
        })
        .text(function(d) {
          if (selectedDataDisplay === 'dollar') {
            return '$' + FORMAT_NUMBER(yScales.invert(mouse[1])/1000000) + ' million';
          }
          return FORMAT_NUMBER(yScales.invert(mouse[1])) + ' %';
        })
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
      .attr('fill', function(d) { return selectedDataDisplay === d ? cMENU_ON : cMENU_OFF; })
      .attr('pointer-events', function(d) { return selectedDataDisplay === d ? 'none' : 'all'; })

    d3.selectAll('.display--option-text')
      .style('font-weight', function(d){ return selectedDataDisplay === d ? 'bold' : 'auto'; })
      .attr('opacity', function(d) { return selectedDataDisplay === d ? 1 : 0.5; })
  }

  function updateChart() {
    /*
      Update chart to display data in $ or % based on user selection
    */
    updateYScale();

    d3.select('.axis--y')
      .transition()
      .call(d3.axisLeft(yScales).tickFormat(function(d) { return updateYAxis(d); }))
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
      .delay(function(d) {
        return selectedRiskDisplay === 1 ? ANIMATE_DELAY + ANIMATE_DURATION : ANIMATE_DELAY;
      })
      .attr('y', function(d) { return updateBarY(d); })
      .attr('height', function(d) { return updateBarHeight(d); })

    d3.selectAll('.risk_group')
      .transition()
      .duration(ANIMATE_DURATION)
      .delay(function(d) {
        return selectedRiskDisplay === 1 ? ANIMATE_DELAY : ANIMATE_DELAY + ANIMATE_DURATION;
      })
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
        yScales.domain(
          [0, d3.max(stackedData[stackedData.length - 1],
          function(d) { return d[1]; })]
        );
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
};